import React from 'react';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-cover bg-center min-w-fit min-h-72 min-w-96 w-full text-white font-light" style={{ backgroundImage: 'url("/Footer-BG.png")' }}>   
            <div className="flex flex-row flex-wrap 2xl:justify-between justify-center mx-12 mt-12 px-12 pt-12 min-w-fit  text-left">
                <div className='min-w-min max-w-sm'>
                    <div className='flex flex-row'>
                        <Image
                            src="/android-chrome-192x192.png"
                            width={100}
                            height={100}
                            alt="MerchTrack-Footer-Logo"
                        />
                        <div className='flex flex-col pl-8'>
                            <h1 className='text-xl'>T Minus One</h1>
                            <h1 className='text-4xl font-medium pt-2'>MerchTrack</h1>
                        </div>
                    </div>
                    <p className='text-sm text-justify pt-8 mb-8'>Our platform brings you the latest merchandise from the College of Computer Studies. Whether you're looking for shirts, hoodies, or accessories, easily browse, order, and rep your college spirit in style!</p>
                </div>
                <div className='flex flex-col min-w-max max-w-2xl w-full'>
                    <h1 className='font-bold text-7xl 2xl:self-start self-center'>Get in Touch</h1>
                    <h1 className='text-4xl py-8 2xl:self-start self-center'>tminusone@gmail.com</h1>
                </div>
            </div>
            
            <div className='flex flex-col md:flex-row flex-wrap justify-between mx-12 pb-4 px-12'>
                <hr className='place-self-center w-full mt-4 pb-4'/>
                <div className='flex flex-col xl:flex-row justify-between w-full items-center text-center xl:text-left'>
                    <span className="block text-base font-bold sm:text-center pb-2">© 2023 <a href="#" className="hover:underline">MerchTrack™</a>. All Rights Reserved.</span>
                    <ul className="flex flex-row justify-between items-center mb-6 text-sm md:text-base font-medium sm:mb-0 dark:text-gray-400 max-w-2xl w-full">
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">About</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">Contact</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">FAQs</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">Privacy Policy</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline">Terms of Service</a>
                        </li>
                    </ul>
                </div>
            </div>           
        </footer>
    )
}

export default Footer;