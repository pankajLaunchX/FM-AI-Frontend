import dynamic from "next/dynamic"

const ClientSidebar = dynamic(() => import("../components/Sidebar"))
export default function Layout({
    children,
    params,
}: {
    children: React.ReactNode
    params: { conversationId?: string }
}) {

    return (
        <ClientSidebar children={children} cid={params.conversationId} />
    )
}