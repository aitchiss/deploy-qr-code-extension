import { useNetlifySDK } from "@netlify/sdk/ui/react";
import {
  ListLoader,
  SiteDeploySurface,
} from "@netlify/sdk/ui/react/components";
import QRCodeStyling from "qr-code-styling";
import { useEffect, useRef } from "react";
import { trpc } from "../trpc";

export default function SiteDeploy({}) {
  const el = useRef(null);

  const {
    context: { deployId },
  } = useNetlifySDK();

  const deployQuery = trpc.deployDetails.query.useQuery({
    deployId: deployId ?? "",
  });

  useEffect(() => {
    if (deployQuery.isLoading) {
      return;
    }

    const deployUrl = deployQuery.data?.deployUrl;
    if (!deployUrl) {
      return;
    }

    const qrCode = new QRCodeStyling({
      width: 200,
      height: 200,
      data: deployUrl,
      backgroundOptions: {
        color: "transparent",
      },
      qrOptions: {
        errorCorrectionLevel: "M",
      },
      dotsOptions: {
        type: "classy",
        color: "#014847",
      },
      cornersDotOptions: {
        color: "#014847",
      },
      cornersSquareOptions: {
        type: "square",
        color: "#04a29f",
      },
    });

    // @ts-ignore
    qrCode.append(el.current);
  }, [deployQuery.isLoading]);

  return (
    <SiteDeploySurface>
      {deployQuery.error && (
        <p>Something went wrong; refresh the page to try again.</p>
      )}
      {deployQuery.isLoading && !deployQuery.data && (
        <>
          <p className="mt-4">Preparing your QR code...</p>
          <ListLoader />
        </>
      )}
      {deployQuery.data && (
        <p className="mt-4">Scan the QR code below to view your deploy:</p>
      )}
      <div ref={el} id="qr-canvas"></div>
    </SiteDeploySurface>
  );
}
