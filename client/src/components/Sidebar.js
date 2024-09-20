// import React, { useState, useEffect } from 'react'
import React from 'react'
// import { apiGetCategories } from '../apis/app'
import { NavLink } from 'react-router-dom'
import { createSlug } from '../ultils/helpers'
import { useSelector } from 'react-redux'
const Sidebar = () => {
    const { categories } = useSelector(state => state.app)


    return (

        <div className="flex flex-col border">
            {categories?.map(el => (
                // sử dụng navlink để trả về thuộc tính cho biết là link nào đang đc active
                <NavLink
                    key={createSlug(el.title)}
                    to={createSlug(el.title)}
                    className={({ isActive }) => isActive ? 'bg-main text-white px-5 pt-[15px] pb-[14px] tex-sm hover:text-main'
                        : 'px-5 pt-[15px] pb-[14px] tex-sm hover:text-main'}
                >
                    {el.title}
                </NavLink>
            ))}
        </div>
    )
}

export default Sidebar