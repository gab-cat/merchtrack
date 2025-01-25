import React from 'react';
import { CgSpinnerAlt } from 'react-icons/cg';

const GeneralLoading = () => {
  return (
    <output className="flex h-screen w-screen items-center justify-center border bg-slate-100 font-inter" aria-busy="true">
      <div className="my-auto  flex  flex-col items-center justify-normal space-y-6 text-primary-500">
        <CgSpinnerAlt  className="animate-spin text-6xl"/>
        <p className="mt-2 text-5xl font-bold tracking-tight text-gray-700">Loading...</p>
        <p className="mt-2 text-xl font-light tracking-tight text-gray-500">Please wait while we fetch things for you</p>
      </div>
    </output>
  );
};

export default GeneralLoading;