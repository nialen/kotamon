type GoogleAnalyticsProps = {
  readonly measurementId?: string;
};

export function GoogleAnalytics(_props: GoogleAnalyticsProps) {
  const measurementId = _props.measurementId?.trim();

  if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) {
    return null;
  }

  const configScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');
`;

  return (
    <>
      <script
        async
        data-kotamon-analytics="loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <script
        data-kotamon-analytics="config"
        dangerouslySetInnerHTML={{ __html: configScript }}
      />
    </>
  );
}
