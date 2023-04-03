import { PendingStampPCD, StampPCDStatus } from "@pcd/passport-interface";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { PASSPORT_SERVER_URL } from "../src/constants";

export const PendingPCDLoader = ({
  pendingStampPCD,
  setPcdStr,
}: {
  pendingStampPCD: PendingStampPCD | undefined;
  setPcdStr: any;
}) => {
  const [status, setStatus] = useState<StampPCDStatus>(StampPCDStatus.NONE);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;

    // TODO: not sure if this is the best way to ping the server repeatedly,
    // or if this leads to weird sitautions where this interval continues to run
    // after people navigate away from the page?
    const getStatus = () => {
      if (pendingStampPCD !== undefined) {
        fetch(`${PASSPORT_SERVER_URL}pcds/status/${pendingStampPCD.hash}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            setStatus(data.status);
            if (data.status === StampPCDStatus.COMPLETE) {
              setPcdStr(data.proof);
              clearInterval(interval);
            }
          })
          .catch((error) => console.error(error));
      }
    };

    interval = setInterval(getStatus, 5000);

    return () => clearInterval(interval);
  }, [pendingStampPCD, setPcdStr]);

  const StyledDiv = styled.div`
    margin: 10px 0 10px 0;
    border: 1px solid ${statusColor[status]};
    padding: 5px;
    color: ${statusColor[status]};
  `;

  return <StyledDiv>Stamp Status: {status}</StyledDiv>;
};

const statusColor: Record<StampPCDStatus, string> = {
  [StampPCDStatus.ERROR]: "#f44336",
  [StampPCDStatus.COMPLETE]: "#4caf50",
  [StampPCDStatus.PROVING]: "#2196f3",
  [StampPCDStatus.QUEUED]: "ff9800",
  [StampPCDStatus.NONE]: "00000",
};