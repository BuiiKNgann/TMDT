import React from 'react'
import { formatMoney } from '../ultils/helpers'
import label from '../assets/label.png'
import labelBLue from '../assets/label-blue.png'
const Product = ({ productData, isNew }) => {
    return (
        <div className='w-full text-base px-[10px]'>
            <div className='w-full border p-[15px] flex-col items-center'>
                <div className='w-full relative'>
                    <img src={productData?.thumb || 'https://biolabscientific.com/content/products-images/Automatic-Slide-Stainer-BHTP-402-7-inch-color-touch-screen-operation-18-Histology-Cytology-Tissue-dyeing-Slide-Stainer-s1-Biolab.jpg'} alt="" className='w-[243px] h-[243px] object-cover' />

                    <img src={isNew ? label : labelBLue} alt="" className={`absolute w-[120px] top-[-32px] left-[-42px] object-contain`} />
                    <span className={`font-bold top-[-10px] left-[-12px] text-white absolute ${isNew ? '' : 'text-sm'}`}>{isNew ? 'New' : 'Trending'}</span>
                </div>

                <div className='flex flex-col mt-[15px] items-start gap-1 w-full'>
                    <span className='line-clamp-1'>{productData?.title}</span>
                    <span>{`${formatMoney(productData?.price)} VNĐ`}</span>
                </div>
            </div>

        </div>

    )
}

export default Product