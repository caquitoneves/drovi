// packages/design-system/src/components/dashboard/base-layout.tsx

export const BaseLayout = ({
                               role, // 'admin' | 'motoboy' | 'business'
                               children
                           }: {
    role: string;
    children: React.ReactNode;
}) => {
    return (
        <div className={`dashboard ${role}-theme`}>
            <Sidebar role={role} />
            <div className="content">
                <Header role={role} />
                {children}
            </div>
        </div>
    );
};