import React from "react";
import { Outlet } from 'react-router-dom' //Outlet tượng trưng cho component con 
import { Header, Navigation } from '../../components'

const Public = () => {
    return (
        <div className='w-full flex flex-col items-center'>
            <Header />
            <Navigation />
            <div className="w-main">
                <Outlet />
            </div>

        </div>
    )
}
export default Public