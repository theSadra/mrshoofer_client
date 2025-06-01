import AppNavbar from "@/app/components/AppNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AppNavbar />
            <main>{children}</main>
        </>
    );
}