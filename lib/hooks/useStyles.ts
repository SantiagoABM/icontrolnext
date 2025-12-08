import { createStyles } from "@mantine/styles";
export const useStyles = createStyles((theme) => ({
    item: {
       
        position: "relative",
        zIndex: 0,
        transition: "transform 150ms ease",
        paddingTop: 5,
        paddingBottom: 5,

        '&[data-active]': {
            transform: "scale(1.0)",
            zIndex: 1,
            boxShadow: theme.shadows.md
        },
    },
}));