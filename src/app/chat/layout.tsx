import dynamic from "next/dynamic"

const ClientSidebar = dynamic(() => import("../components/Sidebar"))
export default function Layout({
    children
}: {
    children: React.ReactNode
}) {

    return (
        <ClientSidebar>
            {children}
        </ClientSidebar>
    )
}