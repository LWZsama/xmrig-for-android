import React, { useCallback, FC } from 'react';
import {
  Dimensions,
  ScaledSize,
  StyleSheet,
} from 'react-native';
import _ from 'lodash';
import prettyBytes from 'pretty-bytes';
// @ts-ignore
import { hashrateToString } from 'hashrate';
import { VictoryArea, VictoryChart, VictoryClipContainer } from 'victory-native';
import {
  Colors, View, Text, ViewProps, Card, GridView, Assets,
} from 'react-native-ui-lib';
import { IMinerSummary } from '../../../core/hooks';
import { MinerCard } from '../components/miner-card.component';
import { IHashrateHistory, WorkingState } from '../../../core/session-data/session-data.interface';

const screen = Dimensions.get('screen');

type SmallHashrateChartProps = {
  hashrateHistoryData: number[];
};

type XMRigViewProps = ViewProps & {
    hashrateHistory: IHashrateHistory;
    minerData: IMinerSummary | null;
    workingState: string;
}

const formatHashrate = (value: unknown): string => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return '0';
  }
  try {
    return hashrateToString(numericValue, true);
  } catch {
    return '0';
  }
};

const XMRigViewComponent:React.FC<XMRigViewProps> = ({
  hashrateHistory,
  minerData,
  workingState,
}) => {
  const [dimensions, setDimensions] = React.useState<ScaledSize>({
    ...screen,
    width: screen.width - 19,
  });

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ screen: _screen }) => {
        setDimensions({
          ..._screen,
          width: _screen.width - 19,
        });
      },
    );
    return () => subscription?.remove();
  }, []);

  // Victory creates a fairly large SVG tree. There is no useful chart to show
  // while the miner is idle, so keep the native layout but avoid mounting SVG
  // graphs until real samples arrive.
  const hashrateDataAvailable = workingState !== WorkingState.NOT_WORKING
    && minerData !== null;

  const HashrateChart = React.useCallback(() => {
    if (!hashrateDataAvailable) {
      return <View flex height={100} />;
    }
    return (
      <View flex>
        <VictoryArea
          groupComponent={<VictoryClipContainer clipPadding={{ top: 10, right: 10, left: 10 }} />}
          padding={{
            top: 10,
            bottom: 0,
          }}
          height={100}
          data={[0, ..._.takeRight(hashrateHistory.historyCurrent || [], 10), 0]}
          style={{
            data: {
              fill: Colors.$backgroundPrimaryLight,
              stroke: Colors.$outlinePrimary,
              strokeWidth: 2,
            },
          }}
          interpolation="natural"
          standalone
        />
      </View>
    );
  }, [hashrateDataAvailable, hashrateHistory.historyCurrent]);

  const SmallHashrateChart:FC<SmallHashrateChartProps> = useCallback((
    { hashrateHistoryData = [] },
  ) => {
    if (!hashrateDataAvailable) {
      return <View flex height={50} />;
    }
    return (
      <View flex right>
        <VictoryChart
          height={50}
          width={100}
          padding={{
            top: 5,
            bottom: 0,
          }}
        >
          <VictoryArea
            groupComponent={<VictoryClipContainer clipPadding={{ top: 5, right: 0 }} />}
            data={_.takeRight(hashrateHistoryData, 12)}
            style={{
              data: {
                fill: Colors.$backgroundPrimaryLight,
                stroke: Colors.$outlinePrimary,
                strokeWidth: 1,
              },
            }}
            interpolation="natural"
          />
        </VictoryChart>
      </View>
    );
  }, [hashrateDataAvailable]);

  const GridCard = React.useCallback(({ title, text, children }) => (
    <MinerCard title={title}>
      <Card.Section
        paddingH-10
        paddingB-10
        paddingT-5
        content={[
          { text, text65: true },
        ]}
        style={{
          borderTopRightRadius: 0,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      />
      {children && children}
    </MinerCard>
  ), []);

  const GridHashrateCard = React.useCallback(({ title, subTitle, children }) => (
    <MinerCard title={title} subTitle={subTitle}>
      {children}
    </MinerCard>
  ), []);

  const RenderCPUGrid = React.useCallback(() => (
    <GridView
      items={[
        {
          renderCustomItem: () => (
            <GridCard title="Brand" text={minerData?.cpu?.brand || 'N/A'}>
              <Card.Image source={Assets.icons.cpu} height={25} width={25} style={{ position: 'absolute', right: 10, top: 10 }} tintColor={Colors.$iconNeutral} />
            </GridCard>
          ),
        },
        {
          renderCustomItem: () => (
            <GridCard title="Cores" text={minerData?.cpu?.cores || 'N/A'}>
              <Card.Image source={Assets.icons.cpuCore} height={25} width={25} style={{ position: 'absolute', right: 10, top: 10 }} tintColor={Colors.$iconNeutral} />
            </GridCard>
          ),
        },
        { renderCustomItem: () => <GridCard title="Threads" text={minerData?.cpu?.threads || 'N/A'} /> },
        { renderCustomItem: () => <GridCard title="Arch" text={minerData?.cpu?.arch || 'N/A'} /> },
      ]}
      viewWidth={dimensions.width}
      numColumns={2}
    />
  ), [minerData, dimensions.width]);

  const RenderSharesGrid = React.useCallback(() => (
    <GridView
      items={[
        { renderCustomItem: () => <GridCard title="Accepted" text={minerData?.connection?.accepted || 0} /> },
        { renderCustomItem: () => <GridCard title="Rejected" text={minerData?.connection?.rejected || 0} /> },
        { renderCustomItem: () => <GridCard title="Total" text={(minerData?.connection?.accepted || 0) + (minerData?.connection?.rejected || 0)} /> },
      ]}
      numColumns={3}
      viewWidth={dimensions.width}
    />
  ), [minerData, dimensions.width]);

  const RenderSharesMoreGrid = React.useCallback(() => (
    <GridView
      items={[
        { renderCustomItem: () => <GridCard title="Difficulty" text={minerData?.results?.diff_current || 'N/A'} /> },
        { renderCustomItem: () => <GridCard title="Total Hashes" text={formatHashrate(minerData?.results?.hashes_total)} /> },
      ]}
      numColumns={2}
      viewWidth={dimensions.width}
    />
  ), [minerData, dimensions.width]);

  const RenderMemoryGrid = React.useCallback(() => (
    <GridView
      items={[
        {
          renderCustomItem: () => (
            <GridCard title="Free Mem" text={prettyBytes(minerData?.resources?.memory?.free || 0)}>
              <Card.Image source={Assets.icons.memory} height={25} width={28} style={{ position: 'absolute', right: 10, top: 10 }} tintColor={Colors.$iconNeutral} />
            </GridCard>
          ),
        },
        {
          renderCustomItem: () => (
            <GridCard title="Res. Mem" text={prettyBytes(minerData?.resources?.memory?.resident_set_memory || 0)}>
              <Card.Image source={Assets.icons.memory} height={25} width={28} style={{ position: 'absolute', right: 10, top: 10 }} tintColor={Colors.$iconNeutral} />
            </GridCard>
          ),
        },
      ]}
      numColumns={2}
      viewWidth={dimensions.width}
    />
  ), [minerData, dimensions.width]);

  const RenderHashrateGrid = React.useCallback(() => (
    <GridView
      items={[
        {
          renderCustomItem: () => (
            <GridHashrateCard title="10s" subTitle={`${formatHashrate(_.last(hashrateHistory.history10s))}/s`}>
              <SmallHashrateChart
                hashrateHistoryData={hashrateHistory.history10s}
              />
            </GridHashrateCard>
          ),
        },
        {
          renderCustomItem: () => (
            <GridHashrateCard title="60s" subTitle={`${formatHashrate(_.last(hashrateHistory.history60s))}/s`}>
              <SmallHashrateChart
                hashrateHistoryData={hashrateHistory.history60s}
              />
            </GridHashrateCard>
          ),
        },
        {
          renderCustomItem: () => (
            <GridHashrateCard title="15m" subTitle={`${formatHashrate(_.last(hashrateHistory.history15m))}/s`}>
              <SmallHashrateChart
                hashrateHistoryData={hashrateHistory.history15m}
              />
            </GridHashrateCard>
          ),
        },
        {
          renderCustomItem: () => (
            <GridHashrateCard title="max" subTitle={`${formatHashrate(_.last(hashrateHistory.historyMax))}/s`}>
              <SmallHashrateChart
                hashrateHistoryData={hashrateHistory.historyMax}
              />
            </GridHashrateCard>
          ),
        },
      ]}
      numColumns={4}
      viewWidth={dimensions.width}
    />
  ), [
    hashrateDataAvailable,
    hashrateHistory.history10s,
    hashrateHistory.history60s,
    hashrateHistory.history15m,
    hashrateHistory.historyMax,
    dimensions.width,
  ]);

  const RenderModeAlgoGrid = React.useCallback(() => (
    <GridView
      items={[
        {
          renderCustomItem: () => (
            <GridCard title="Mode" text={workingState || 'N/A'}>
              <Card.Image source={Assets.icons.working} height={30} width={30} style={{ position: 'absolute', right: 5, top: 5 }} tintColor={Colors.$iconNeutral} />
            </GridCard>
          ),
        },
        {
          renderCustomItem: () => (
            <GridCard title="Algo" text={minerData?.algo || 'N/A'}>
              <Card.Image source={Assets.icons.blockchain} height={30} width={30} style={{ position: 'absolute', right: 5, top: 5 }} tintColor={Colors.$iconNeutral} />
            </GridCard>
          ),
        },
      ]}
      numColumns={2}
      viewWidth={dimensions.width}
    />
  ), [minerData, workingState, dimensions.width]);

  return (
    <>
      <View flex row paddingV-10>
        <RenderModeAlgoGrid />
      </View>
      <View flex paddingV-10>
        <View flex row spread paddingB-5 marginB-10 style={styles.sectionDiv}>
          <Text text60>Hashrate</Text>
        </View>
        <View flex row>
          <RenderHashrateGrid />
        </View>
        <View flex row paddingT-10 style={{ zIndex: 0 }}>
          <MinerCard
            title="Live Hashrate"
            subTitle={`${formatHashrate(_.last(hashrateHistory.historyCurrent))}/s`}
            cardProps={{ row: true, center: true }}
            badgeProps={{ size: 20 }}
          >
            <HashrateChart />
          </MinerCard>
        </View>
      </View>
      <View flex paddingV-10>
        <View flex row spread paddingB-5 marginB-10 style={styles.sectionDiv}>
          <Text text60>Shares</Text>
        </View>
        <View flex row>
          <RenderSharesGrid />
        </View>
        <View flex row paddingT-10>
          <RenderSharesMoreGrid />
        </View>
      </View>
      <View flex paddingV-10>
        <View flex row spread paddingB-5 marginB-10 style={styles.sectionDiv}>
          <Text text60>CPU</Text>
        </View>
        <View flex row>
          <RenderCPUGrid />
        </View>
      </View>
      <View flex paddingV-10>
        <View flex row spread paddingB-5 marginB-10 style={styles.sectionDiv}>
          <Text text60>Memory</Text>
        </View>
        <View flex row>
          <RenderMemoryGrid />
        </View>
      </View>
    </>
  );
};

type XMRigViewErrorBoundaryState = {
  hasError: boolean;
};

class XMRigViewErrorBoundary extends React.Component<
  XMRigViewProps,
  XMRigViewErrorBoundaryState
> {
  public constructor(props: XMRigViewProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): XMRigViewErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error) {
    console.error('Miner statistics failed to render', error);
  }

  public render() {
    const { hasError } = this.state;
    const { hashrateHistory, minerData, workingState } = this.props;

    if (hasError) {
      return (
        <View flex padding-20>
          <Text text70>Miner statistics are temporarily unavailable.</Text>
        </View>
      );
    }
    return (
      <XMRigViewComponent
        hashrateHistory={hashrateHistory}
        minerData={minerData}
        workingState={workingState}
      />
    );
  }
}

export const XMRigView = React.memo(
  (props: XMRigViewProps) => (
    <XMRigViewErrorBoundary
      hashrateHistory={props.hashrateHistory}
      minerData={props.minerData}
      workingState={props.workingState}
    />
  ),
  (previous, next) => previous.minerData === next.minerData
    && previous.workingState === next.workingState
    && previous.hashrateHistory.historyCurrent === next.hashrateHistory.historyCurrent
    && previous.hashrateHistory.history10s === next.hashrateHistory.history10s
    && previous.hashrateHistory.history60s === next.hashrateHistory.history60s
    && previous.hashrateHistory.history15m === next.hashrateHistory.history15m
    && previous.hashrateHistory.historyMax === next.hashrateHistory.historyMax,
);

const styles = StyleSheet.create({
  sectionDiv: {
    borderBottomWidth: 1,
    borderColor: Colors.grey30,
  },
});
