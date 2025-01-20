const PageTitle = ({ title, description } : { title: string, description: string } ) => {
  return (
    <>
      <div className="place-self-center py-4 pt-16 text-5xl tracking-tighter md:text-8xl">
        {title}
      </div>
      <div className="w-5/6 place-self-center text-center text-sm">
        {description}
      </div>
    </>
  );
};

export default PageTitle;