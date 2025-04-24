
export default function HelloPage (){
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 lg:px-10">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">Welcome</h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Discover our amazing content and services designed just for you.
                </p>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
              <div className="aspect-video overflow-hidden rounded-xl">
                <picture
                  src="/placeholder.svg?height=720&width=1280"
                  alt="Hero image"
                  width={1280}
                  height={720}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
}