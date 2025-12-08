
import NavbarComponent from "@/lib/components/common/navbarV2.component";
import SessionActivityProvider from "@/lib/providers/sessionActivity.provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Control Verde",
    description: "Control Verde",
};

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SessionActivityProvider>
            <NavbarComponent>{children}</NavbarComponent>
        </SessionActivityProvider>
    );
}
