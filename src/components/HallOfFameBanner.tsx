export function HallOfFameBanner() {
  return (
    <div className="relative mx-auto mt-8 flex w-full max-w-2xl justify-center px-4">
      {/* Ribbon tails */}
      <div className="absolute left-1/2 top-2 h-16 w-[calc(100%-2rem)] -translate-x-1/2">
        <div className="absolute left-0 top-0 h-full w-10 origin-top-left -skew-y-12 bg-amber-950" />
        <div className="absolute right-0 top-0 h-full w-10 origin-top-right skew-y-12 bg-amber-950" />
      </div>

      {/* Main banner */}
      <div className="relative rounded-md bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 px-10 py-4 shadow-lg ring-2 ring-amber-500/40">
        <h1 className="text-center font-serif text-3xl font-bold tracking-[0.2em] text-amber-100 uppercase sm:text-4xl">
          Hall of Fame
        </h1>
        <p className="mt-1 text-center text-xs tracking-[0.3em] text-amber-300/80 uppercase">
          of Dank Memes
        </p>
      </div>
    </div>
  );
}
