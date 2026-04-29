'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Score } from './score-chart';

type CountChartProps = {
  data: Score[];
  title?: string;
};

function CountBar({ x = 0, y = 0, width = 0, height = 0 }: any) {
  if (height <= 0) return null;
  const r = Math.min(7, width / 3);
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="#0ea5e9"
      rx={r}
    />
  );
}

function CountTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{ value?: number }>;
}) {
  if (!active || !label || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="countTooltip">
      <p className="countTooltip__title">{label}</p>
      <p>จำนวนผู้สอบ: <strong>{val?.toLocaleString()} คน</strong></p>
    </div>
  );
}

export function CountChart({
  data,
  title = 'จำนวนผู้สอบรายวิชา',
}: CountChartProps) {
  const maxCount = data.length ? Math.max(...data.map((d) => d.count)) : 0;
  const yMax = Math.ceil(maxCount / 100) * 100 + 100;

  const manySubjects = data.length > 5;
  const chartMinWidth = Math.max(480, data.length * 110);

  return (
    <>
      <section className="countChart">
        <div className="countChart__header">
          <p className="countChart__eyebrow">ข้อมูลผู้สอบ</p>
          <h2 className="countChart__title">{title}</h2>
        </div>

        <div className="countChart__plot">
          <div style={{ minWidth: chartMinWidth, height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 28,
                  right: 24,
                  left: 0,
                  bottom: manySubjects ? 64 : 16,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(148,163,184,0.18)"
                />
                <XAxis
                  dataKey="subject"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#475569',
                    fontSize: manySubjects ? 11 : 13,
                    fontWeight: 700,
                  }}
                  angle={manySubjects ? -38 : 0}
                  textAnchor={manySubjects ? 'end' : 'middle'}
                  height={manySubjects ? 80 : 40}
                />
                <YAxis
                  domain={[0, yMax]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  width={52}
                  tickFormatter={(v: number) => v.toLocaleString()}
                />
                <Tooltip
                  content={<CountTooltip />}
                  cursor={{ fill: 'rgba(15,23,42,0.04)' }}
                />
                <Bar
                  dataKey="count"
                  barSize={44}
                  shape={(p: any) => <CountBar {...p} />}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="count"
                    position="top"
                    formatter={(v: unknown) =>
                      typeof v === 'number' ? v.toLocaleString() : String(v ?? '')
                    }
                    style={{ fill: '#0f172a', fontSize: 11, fontWeight: 700 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <style jsx>{`
        .countChart {
          width: min(1140px, 100%);
          margin: 0 auto;
          padding: 24px 28px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 28px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.98) 100%
          );
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
        }

        .countChart__header {
          margin-bottom: 4px;
        }

        .countChart__eyebrow {
          margin: 0 0 6px;
          color: #0ea5e9;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .countChart__title {
          margin: 0;
          font-size: clamp(1.2rem, 2.5vw, 1.8rem);
          font-weight: 800;
          line-height: 1.15;
          color: #0f172a;
        }

        .countChart__plot {
          width: 100%;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-top: 8px;
        }

        :global(.countTooltip) {
          padding: 11px 14px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 13px;
          color: #0f172a;
          background: rgba(255, 255, 255, 0.97);
          box-shadow: 0 14px 36px rgba(15, 23, 42, 0.13);
          font-size: 0.88rem;
          line-height: 1.8;
        }
        :global(.countTooltip__title) {
          margin: 0 0 4px;
          font-size: 0.93rem;
          font-weight: 800;
        }
        :global(.countTooltip p) { margin: 0; }

        @media (max-width: 700px) {
          .countChart {
            padding: 18px;
            border-radius: 20px;
          }
        }
      `}</style>
    </>
  );
}
