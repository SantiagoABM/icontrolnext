import { Button, Text } from "@mantine/core";
import { IconArrowRight, IconInfoSquareRounded, IconInfoSquareRoundedFilled, IconLink } from "@tabler/icons-react";

export default function ButtonActionTableComponent({
  texto,
  action,
}: {
  texto: string;
  action: () => void;
}) {
  return (
    <Button
      variant={"light"}
      onClick={action}
      size="sm"
      w={"100%"}
      styles={(theme) => ({        
        root: {
          transition: "all 0.2s ease",
        },
      })}
    >
      <Text fz={"sm"} fw={"600"} w={"100%"} lineClamp={1}>
        {texto}
      </Text>
    </Button>
  );
}
