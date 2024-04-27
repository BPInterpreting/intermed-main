interface HeadingProps {
    title: string;
    description?: string;
}

export const Heading: React.FC<HeadingProps> = ({
    title,
    description
}) => {
    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-wide">{title}</h1>
                <h3 className="text-sm text text-muted-foreground">{description}</h3>
            </div>
        </>

    );
}