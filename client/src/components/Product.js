import React, { useState } from 'react'
import { formatMoney } from '../ultils/helpers'
import label from '../assets/new.png'
import trending from '../assets/trending.png'
import { renderStartFromNumber } from '../ultils/helpers'
import { SelectOption } from './'
import icons from '../ultils/icons'
import { Link } from 'react-router-dom'
import path from '../ultils/path'

const { AiFillEye, IoMdMenu, FaHeart } = icons
const Product = ({ productData, isNew }) => {
    const [isShowOption, setIsShowOption] = useState(false)

    //chi-tiet-san-pham/pid/title/sdasdsd
    return (
        <div className='w-full text-base px-[10px]'>
            <Link
                className='w-full border p-[15px] flex-col items-center'
                to={`/${path.DETAIL_PRODUCT}/${productData?._id}/${productData?.title}`}
                onMouseEnter={e => {
                    e.stopPropagation()
                    setIsShowOption(true)
                }}
                onMouseLeave={e => {
                    e.stopPropagation()
                    setIsShowOption(false)
                }}
            >
                <div className='w-full relative'>
                    {isShowOption && <div className='absolute bottom-[-10px] left-0 right-0 flex justify-center gap-2 animate-slide-top'>
                        <SelectOption icon={<AiFillEye />} />
                        <SelectOption icon={<IoMdMenu />} />
                        <SelectOption icon={<FaHeart />} />
                    </div>}

                    <img src={productData?.thumb || 'https://biolabscientific.com/content/products-images/Automatic-Slide-Stainer-BHTP-402-7-inch-color-touch-screen-operation-18-Histology-Cytology-Tissue-dyeing-Slide-Stainer-s1-Biolab.jpg'} alt="" className='w-[274px] h-[274px] object-cover' />

                    <img src={isNew ? label : trending} alt="" className={`absolute w-[100px] h-[45px ] top-[0] right-[0] object-cover`} />

                </div>

                <div className='flex flex-col mt-[15px] items-start gap-1 w-full'>
                    <span className='flex h-4'>{renderStartFromNumber(productData?.totalRatings)?.map((el, index) => (

                        <span key={index}>{el}</span>
                    ))}</span>
                    <span className='line-clamp-1'>{productData?.title}</span>
                    <span>{`${formatMoney(productData?.price)} VNĐ`}</span>
                </div>
            </Link>

        </div>

    )
}

export default Product