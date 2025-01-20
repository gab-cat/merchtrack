import { CgSpinnerAlt } from "react-icons/cg";

const Loading = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center  border bg-slate-100">
      <div className="my-auto  flex  flex-col items-center justify-normal space-y-4 text-5xl text-primary-500">
        <CgSpinnerAlt  className="animate-spin text-6xl"/>
        <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-700">Loading...</p>
        <p className="mt-2 text-xl font-light tracking-tight text-gray-500">Please wait while we fetch things for you</p>
      </div>
    </div>
  );
};

export default Loading;