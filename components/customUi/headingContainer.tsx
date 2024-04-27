interface HeadingContainerProps {
    children: React.ReactNode;
}

const HeadingContainer = ({
    children
}: HeadingContainerProps) => {
  return(
      <div className='flex flex-row justify-between items-center'>
            {children}
      </div>
  )
}

export default HeadingContainer;