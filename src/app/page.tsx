import HeaderLP from "@/components/public/header";
import Footer from "@/components/public/footer";


export default async function Home() {
  return (
    <div>
      <HeaderLP />
      <div className="text-center text-4xl font-bold ">
        Hello Worlds!
      </div>
      <div className="h-lvh"></div> {/* Temporary contents section */}
      <Footer /> 
    </div>
  );
}
