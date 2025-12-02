
import GasMonitor from "./components/GasMonitor";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 20,
        fontFamily: "Arial, sans-serif",
        background: "linear-gradient(to right, #e0f7fa, #ffffff)", // gradient nhẹ
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: 20,
          background: "white",
          borderRadius: 12,
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        }}
      >
        <GasMonitor />
      </div>
    </div>
  );
}

export default App;

