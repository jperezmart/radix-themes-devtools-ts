import { createFileRoute } from '@tanstack/react-router';
import {
  Button,
  Card,
  Flex,
  Heading,
  Text,
  Badge,
  TextField,
} from '@radix-ui/themes';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <Flex direction="column" gap="6" maxWidth="600px">
      <Heading size="8">Radix Themes Devtools</Heading>
      <Text color="gray">
        Open the TanStack Devtools panel and go to the{' '}
        <Badge>Radix Themes</Badge> tab to customize the theme in real time.
      </Text>

      <Card>
        <Flex direction="column" gap="3">
          <Heading size="4">Sample components</Heading>
          <TextField.Root placeholder="Type something…" />
          <Flex gap="2">
            <Button>Primary</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
