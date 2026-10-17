import type { ReactNode } from "react";
import { Alert, Anchor, Card, Code, List, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { Nodes, Root } from "mdast";
import type {} from "mdast-util-directive";
import { TermLink } from "./glossary-terms";
import { FORMULAS, isFormulaId, lessonSections, type LessonContainerBlock } from "@elektro/shared";

/**
 * Renders a parsed lesson body (`parseLessonBody` from @elektro/shared - the
 * same parser the API validates with). Raw HTML in the Markdown is never
 * rendered. Level-2 headings get the section ids the reader tracks.
 */
export function LessonBody({ tree }: { tree: Root }) {
  const sectionIds = lessonSections(tree).map((section) => section.id);
  let sectionIndex = 0;

  return (
    <Stack gap="md">
      {tree.children.map((node, index) => {
        const id =
          node.type === "heading" && node.depth === 2 ? sectionIds[sectionIndex++] : undefined;
        return <Block key={index} node={node} sectionId={id} />;
      })}
    </Stack>
  );
}

const BLOCK_STYLE: Record<LessonContainerBlock, { color: string; variant: "card" | "alert" }> = {
  goals: { color: "blue", variant: "card" },
  example: { color: "gray", variant: "card" },
  safety: { color: "red", variant: "alert" },
  mistake: { color: "orange", variant: "alert" },
  exam: { color: "violet", variant: "alert" },
};

function Block({ node, sectionId }: { node: Nodes; sectionId?: string }): ReactNode {
  const { t } = useTranslation();

  switch (node.type) {
    case "heading":
      return (
        <Title
          order={Math.min(node.depth + 1, 6) as 2 | 3 | 4 | 5 | 6}
          id={sectionId}
          data-section={sectionId}
          style={{ scrollMarginTop: 80 }}
          mt={node.depth === 2 ? "md" : "xs"}
        >
          <Inline nodes={node.children} />
        </Title>
      );
    case "paragraph":
      return (
        <Text component="p" m={0} style={{ lineHeight: 1.6 }}>
          <Inline nodes={node.children} />
        </Text>
      );
    case "list":
      return (
        <List type={node.ordered ? "ordered" : "unordered"} spacing="xs" style={{ lineHeight: 1.6 }}>
          {node.children.map((item, index) => (
            <List.Item key={index}>
              <Stack gap={4}>
                {item.children.map((child, childIndex) =>
                  child.type === "paragraph" ? (
                    // One text element, so bold or code stays inline in the sentence.
                    <Text key={childIndex} component="div" inherit>
                      <Inline nodes={child.children} />
                    </Text>
                  ) : (
                    <Block key={childIndex} node={child} />
                  ),
                )}
              </Stack>
            </List.Item>
          ))}
        </List>
      );
    case "blockquote":
      return (
        <Text component="blockquote" c="dimmed" pl="md" style={{ borderLeft: "3px solid var(--mantine-color-gray-4)", margin: 0 }}>
          {node.children.map((child, index) => (
            <Block key={index} node={child} />
          ))}
        </Text>
      );
    case "code":
      return <Code block>{node.value}</Code>;
    case "thematicBreak":
      return <hr />;
    case "leafDirective": {
      const id = node.attributes?.["id"] ?? "";
      if (node.name !== "formula" || !isFormulaId(id)) return null;
      return (
        <Code block aria-label={t("lessonBlock.formula")} fz="md" ta="center" py="sm">
          {FORMULAS[id].expression}
        </Code>
      );
    }
    case "containerDirective": {
      const style = BLOCK_STYLE[node.name as LessonContainerBlock];
      if (!style) return null;
      const content = (
        <Stack gap="xs">
          {node.children.map((child, index) => (
            <Block key={index} node={child} />
          ))}
        </Stack>
      );
      const title = t(`lessonBlock.${node.name}`);
      return style.variant === "alert" ? (
        <Alert color={style.color} variant="light" title={title} data-block={node.name}>
          {content}
        </Alert>
      ) : (
        <Card withBorder padding="md" radius="md" data-block={node.name}>
          <Text fw={600} c={style.color} mb="xs">
            {title}
          </Text>
          {content}
        </Card>
      );
    }
    default:
      // html, images, definitions and anything unexpected: not rendered.
      return null;
  }
}

const SAFE_URL = /^(https?:\/\/|mailto:|\/(?!\/)|#)/i;

function Inline({ nodes }: { nodes: Nodes[] }): ReactNode {
  return nodes.map((node, index) => {
    switch (node.type) {
      case "text":
        return node.value;
      case "strong":
        return (
          <strong key={index}>
            <Inline nodes={node.children} />
          </strong>
        );
      case "emphasis":
        return (
          <em key={index}>
            <Inline nodes={node.children} />
          </em>
        );
      case "inlineCode":
        return <Code key={index}>{node.value}</Code>;
      case "break":
        return <br key={index} />;
      case "textDirective": {
        // Only `:term[label]{id=key}` survives parsing (shared parseLessonBody).
        const id = node.attributes?.["id"] ?? "";
        return node.name === "term" ? (
          <TermLink key={index} id={id}>
            <Inline nodes={node.children} />
          </TermLink>
        ) : null;
      }
      case "link": {
        // Only web, mail and in-app links; never `javascript:` or `data:` URLs.
        if (!SAFE_URL.test(node.url)) {
          return <Inline key={index} nodes={node.children} />;
        }
        const external = /^https?:\/\//.test(node.url);
        return (
          <Anchor
            key={index}
            href={node.url}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <Inline nodes={node.children} />
          </Anchor>
        );
      }
      default:
        return null;
    }
  });
}
