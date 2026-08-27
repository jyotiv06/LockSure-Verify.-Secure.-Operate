import OfficerSidebar from "./OfficerSidebar";
import OfficerHeader from "./OfficerHeader";

function OfficerLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      <OfficerSidebar />

      <div className="ml-64 min-h-screen">

        <OfficerHeader />

        <main className="p-8">
          {children}
        </main>

      </div>

    </div>
  );
}

export default OfficerLayout;