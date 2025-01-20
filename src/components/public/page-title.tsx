const PageTitle = ({ title, description } : { title: string, description: string } ) => {
  return (
    <>
      <h1 className="place-self-center py-4 pt-16 text-5xl tracking-tighter md:text-8xl">
        {title}
      </h1>
      <p className="w-5/6 place-self-center text-center text-sm">
        {description}
      </p>
    </>
  );
};

export default PageTitle;