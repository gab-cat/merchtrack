import HeaderLP from "../components/ui/header";
import Footer from "../components/ui/footer";

export default async function Home() {
  return (
    <div>
      <HeaderLP />
      <div className="text-4xl font-bold text-center">
        
        Hello Worlds!
      </div>
      <div className="h-lvh"></div> {/* Temporary contents section */}
      <Footer /> 
    </div>
  );
}
