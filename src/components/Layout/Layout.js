import React from 'react'
import Top from '../Top'

const Layout = ({children}) => {
  return (
    <>
        <Top/>
        <main>{children}</main>
    
    
    </>
  )
}

export default Layout