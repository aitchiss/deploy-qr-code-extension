import { useNetlifySDK } from "@netlify/sdk/ui/react";
import {
  Card,
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
    if (deployQuery.isLoading || el.current === null) {
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
        color: "#fff",
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

    qrCode.append(el.current);
  }, [deployQuery.isLoading]);

  return (
    <SiteDeploySurface>
      <div className="tw-mt-4">
        {deployQuery.error && (
          <p>Something went wrong; refresh the page to try again.</p>
        )}
        {deployQuery.isLoading && !deployQuery.data && (
          <div style={{ width: "200px", height: "200px" }}>
            <ListLoader />
          </div>
        )}
        <div ref={el} id="qr-canvas"></div>
      </div>
    </SiteDeploySurface>
  );
}
