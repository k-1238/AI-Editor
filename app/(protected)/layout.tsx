import Providers from "../providers";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Providers>{children}</Providers>
    </>
  );
}
