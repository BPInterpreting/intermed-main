interface WrapperProps {
    children: React.ReactNode
}

const Wrapper = ({
                     children
}: WrapperProps) => {
  return(
      <aside className='fixed left-0 flex flex-col w-[70px] h-full border-r border-[#2D2E35] z-50 bg bg-blue-600'>
            {children}
      </aside>
  )
}

export default Wrapper;