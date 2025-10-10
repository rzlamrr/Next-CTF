export default function GeometricBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Theme-aware base: light uses white, dark uses red-accent gradient */}
      <div className="absolute inset-0 bg-white dark:bg-gradient-to-br dark:from-black dark:via-[#1a0a0a] dark:to-[#2a0505]" />

      {/* Imported SVG pattern overlay */}
      <div
        className="absolute inset-0 h-full w-full bg-center bg-repeat opacity-75"
        style={{
          backgroundImage: 'url(/ttten.svg)',
          backgroundSize: 'auto',
        }}
        aria-hidden="true"
      />
    </div>
  )
}
