import { analyticApi } from "@/lib/api/analytic";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function RaasKurtiesSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["newArrivals"],
    queryFn: analyticApi.getNewArrivals,
  });

  // Default image paths to use as fallback
  const defaultImages = [
    "/lot_0016__PUN0716.png",
    "/lot_0009__PUN0747.png",
    "/image 107.png",
    "/lot_0033__PUN0670.png",
    "/lot_0028__PUN0687.png",
    "/lot_0015__PUN0717.png",
    "/lot_0000__PUN0768.png",
    "/lot_0005__PUN0762.png",
    "/lot_0019__PUN0710.png",
  ];

  // Function to get image source with fallback
  const getImageSource = (index: number) => {
    if (!data || !data[index] || !data[index].img) {
      return defaultImages[index];
    }
    return data[index].img;
  };

  const renderImage = (index: number, aspectRatio: string) => {
    return (
      <div className={`aspect-[${aspectRatio}] relative mb-3`}>
        <Image
          src={getImageSource(index)}
          fill
          alt={data && data[index] ? data[index].name || "Kurti" : "Kurti"}
          className="object-cover object-center"
        />
      </div>
    );
  };

  return (
    <section className="py-12">
      <div className="w-full lg:min-h-screen px-4">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-xl text-[#a08452] mb-1">
            Pure Cotton, Pure You.
          </h2>
          <h3 className="text-4xl font-bold text-[#795d2a] mb-8">
            #WowRaas
          </h3>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-4">
          {/* Column 1 - hidden on mobile */}
          <div className="col-span-1 hidden lg:block">
            {isLoading ? <Skeleton className="mb-3 aspect-[3/4]"  /> : renderImage(0, "3/4")}
            {isLoading ? <Skeleton className="mb-3 aspect-[3/2]"  /> : renderImage(1, "3/2")}
          </div>

          {/* Column 2 */}
          <div className="col-span-1 mt-16">
            {isLoading ? <Skeleton className="mb-3 aspect-[3/4]"  /> : renderImage(2, "3/4")}
            {isLoading ? <Skeleton className="mb-3 aspect-[3/2]"  /> : renderImage(3, "3/2")}
          </div>

          {/* Column 3 */}
          <div className="col-span-1 mt-32">{isLoading?<Skeleton className="mb-3 aspect-[3/4]" />:renderImage(4, "3/4")}</div>

          {/* Column 4 */}
          <div className="col-span-1 mt-16">
            {isLoading ? <Skeleton className="mb-3 aspect-[3/4]"  /> : renderImage(5, "3/4")}
            {isLoading ? <Skeleton className="mb-3 aspect-[3/2]"  /> : renderImage(6, "3/2")}
          </div>

          {/* Column 5 - hidden on mobile */}
          <div className="col-span-1 hidden lg:block">
            {isLoading ? <Skeleton className="mb-3 aspect-[3/4]"  /> : renderImage(7, "3/4")}
            {isLoading ? <Skeleton className="mb-3 aspect-[3/2]"  /> : renderImage(8, "3/2")}
          </div>
        </div>
      </div>
    </section>
  );
}
