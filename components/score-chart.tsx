'use client';

import { useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type Score = {
  subject: string;
  national: number;
  school: number;
  me: number;
  count: number;
};

type ScoreChartProps = {
  data: Score[];
  title?: string;
  onRemove?: (subject: string) => void;
  onEdit?: (oldSubject: string, updated: Score) => void;
};

type EditForm = {
  subject: string;
  national: string;
  school: string;
  me: string;
  count: string;
};

// ─────────────────────────────────────────────
// Star polygon helper
// ─────────────────────────────────────────────
function starPolygon(cx: number, cy: number, r: number): string {
  return Array.from({ length: 10 }, (_, i) => {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.42;
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
  }).join(' ');
}

function StarGlyph({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g style={{ filter: 'drop-shadow(0 0 7px rgba(247,201,72,0.95))' }}>
      <polygon
        points={starPolygon(cx, cy, 13)}
        fill="#f7c948"
        stroke="#fffbe6"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </g>
  );
}

// ─────────────────────────────────────────────
// Single overlay bar shape
//
// Strategy: one <Bar dataKey="national"> renders ALL three visual elements
// (national bg bar, school bar, star) in one SVG <g>.
// This guarantees all three share the EXACT same cx — no separate bar layout.
//
// y + height   = pixel y of value 0 (baseline)
// pixPerUnit   = height / national   (recharts gives y/height for "national")
// schoolY/meY  = derived from the same scale
// ─────────────────────────────────────────────
function OverlayBar(props: any) {
  const { payload, x = 0, width = 0, y = 0, height = 0 } = props;
  if (!payload) return null;

  const cx = x + width / 2;          // horizontal center (same for all 3 elements)
  const baselineY = y + height;       // SVG y coordinate of value = 0

  // Pixel-per-unit scale derived from the national bar
  // If national = 0, everything is at the baseline (height = 0)
  const pixPerUnit = payload.national > 0 ? height / payload.national : 0;

  const nationalH = Math.max(0, height);
  const nationalY = y;

  const schoolH = Math.max(0, Math.round(payload.school * pixPerUnit));
  const schoolY = baselineY - schoolH;

  const meY = baselineY - Math.max(0, payload.me * pixPerUnit);

  return (
    <g>
      {/* ① National bar — wide (52 px), gray, behind */}
      <rect
        x={cx - 26}
        y={nationalY}
        width={52}
        height={nationalH}
        fill="rgba(148,163,184,0.38)"
        stroke="rgba(100,116,139,0.22)"
        strokeWidth={1}
        rx={7}
      />
      {/* ② School bar — narrow (28 px), blue, overlaid in front */}
      <rect
        x={cx - 14}
        y={schoolY}
        width={28}
        height={schoolH}
        fill="#2f6fed"
        rx={5}
      />
      {/* ③ Star — positioned at "me" score level */}
      <StarGlyph cx={cx} cy={meY} />
    </g>
  );
}

// ─────────────────────────────────────────────
// Tooltip
// payload[0].payload is the original data row (Score)
// ─────────────────────────────────────────────
function ScoreTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{ payload?: Score }>;
}) {
  if (!active || !label || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="scoreTooltip">
      <p className="scoreTooltip__title">{label}</p>
      <p>
        <span className="scoreTooltip__dot scoreTooltip__dot--national" />
        ค่าเฉลี่ยประเทศ: <strong>{row.national}</strong>
      </p>
      <p>
        <span className="scoreTooltip__dot scoreTooltip__dot--school" />
        ค่าเฉลี่ยโรงเรียน: <strong>{row.school}</strong>
      </p>
      <p>
        <span className="scoreTooltip__dot scoreTooltip__dot--me" />
        คะแนนของฉัน: <strong>{row.me}</strong>
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export function ScoreChart({
  data,
  title = 'เปรียบเทียบคะแนนสอบ',
  onRemove,
  onEdit,
}: ScoreChartProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    subject: '',
    national: '',
    school: '',
    me: '',
    count: '',
  });
  const [editError, setEditError] = useState('');

  function startEdit(item: Score) {
    setEditingKey(item.subject);
    setEditForm({
      subject: item.subject,
      national: String(item.national),
      school: String(item.school),
      me: String(item.me),
      count: String(item.count),
    });
    setEditError('');
  }

  function cancelEdit() {
    setEditingKey(null);
    setEditError('');
  }

  function saveEdit() {
    if (!editingKey || !onEdit) return;
    const subject = editForm.subject.trim();
    if (!subject) {
      setEditError('ชื่อวิชาห้ามว่าง');
      return;
    }
    if (subject !== editingKey && data.some((d) => d.subject === subject)) {
      setEditError(`วิชา "${subject}" มีอยู่แล้ว`);
      return;
    }
    onEdit(editingKey, {
      subject,
      national: Number(editForm.national) || 0,
      school: Number(editForm.school) || 0,
      me: Number(editForm.me) || 0,
      count: Number(editForm.count) || 0,
    });
    setEditingKey(null);
    setEditError('');
  }

  function setEF(field: keyof EditForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditForm((f) => ({ ...f, [field]: e.target.value }));
      setEditError('');
    };
  }

  const allValues = data.flatMap((d) => [d.national, d.school, d.me]);
  const rawMax = allValues.length ? Math.max(...allValues) : 100;
  const yMax = Math.max(100, Math.ceil(rawMax / 10) * 10 + 5);

  const manySubjects = data.length > 5;
  const chartMinWidth = Math.max(480, data.length * 110);

  return (
    <>
      <section className="scoreChart">
        {/* ── Header ── */}
        <div className="scoreChart__header">
          <div className="scoreChart__heading">
            <p className="scoreChart__eyebrow">ผลการสอบ</p>
            <h1 className="scoreChart__title">{title}</h1>
            <p className="scoreChart__desc">
              แท่งสีเทา&nbsp;=&nbsp;ค่าเฉลี่ยประเทศ &nbsp;·&nbsp;
              แท่งสีน้ำเงิน&nbsp;=&nbsp;ค่าเฉลี่ยโรงเรียน &nbsp;·&nbsp;
              ดาว&nbsp;=&nbsp;คะแนนของฉัน
            </p>
          </div>

          <aside className="scoreChart__legend">
            <div className="scoreChart__legendRow">
              <span className="scoreChart__legendBar scoreChart__legendBar--national" />
              <span>ค่าเฉลี่ยประเทศ</span>
            </div>
            <div className="scoreChart__legendRow">
              <span className="scoreChart__legendBar scoreChart__legendBar--school" />
              <span>ค่าเฉลี่ยโรงเรียน</span>
            </div>
            <div className="scoreChart__legendRow">
              <span className="scoreChart__legendStar" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span>คะแนนของฉัน</span>
            </div>
          </aside>
        </div>

        {/* ── Chart ── */}
        <div className="scoreChart__plot">
          <div style={{ minWidth: chartMinWidth, height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{
                  top: 30,
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
                  width={36}
                />
                <Tooltip
                  content={<ScoreTooltip />}
                  cursor={{ fill: 'rgba(15,23,42,0.04)' }}
                />

                {/*
                  Single Bar — shape renders national + school + star all at once.
                  All three elements share the SAME cx = x + width/2.
                  dataKey="national" so recharts computes y/height for the national score.
                */}
                <Bar
                  dataKey="national"
                  barSize={56}
                  shape={(p: any) => <OverlayBar {...p} />}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="scoreChart__tableWrap">
          <table className="scoreChart__table">
            <thead>
              <tr>
                <th>วิชา</th>
                <th>จำนวนคน</th>
                <th>ค่าเฉลี่ยประเทศ</th>
                <th>ค่าเฉลี่ยโรงเรียน</th>
                <th>คะแนนของฉัน</th>
                {(onEdit || onRemove) && <th className="scoreChart__actionsCol" />}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const isEditing = editingKey === item.subject;
                return (
                  <tr key={item.subject} className={isEditing ? 'scoreChart__editRow' : ''}>
                    {isEditing ? (
                      <>
                        <td>
                          <input
                            className="scoreChart__cellInput"
                            value={editForm.subject}
                            onChange={setEF('subject')}
                          />
                        </td>
                        <td>
                          <input
                            className="scoreChart__cellInput scoreChart__cellInput--num"
                            type="number"
                            value={editForm.count}
                            onChange={setEF('count')}
                          />
                        </td>
                        <td>
                          <input
                            className="scoreChart__cellInput scoreChart__cellInput--num"
                            type="number"
                            value={editForm.national}
                            onChange={setEF('national')}
                          />
                        </td>
                        <td>
                          <input
                            className="scoreChart__cellInput scoreChart__cellInput--num"
                            type="number"
                            value={editForm.school}
                            onChange={setEF('school')}
                          />
                        </td>
                        <td>
                          <input
                            className="scoreChart__cellInput scoreChart__cellInput--num scoreChart__cellInput--me"
                            type="number"
                            value={editForm.me}
                            onChange={setEF('me')}
                          />
                        </td>
                        <td className="scoreChart__actions">
                          <button className="scoreChart__saveBtn" onClick={saveEdit}>
                            บันทึก
                          </button>
                          <button className="scoreChart__cancelBtn" onClick={cancelEdit}>
                            ยกเลิก
                          </button>
                          {editError && (
                            <span className="scoreChart__editErr">{editError}</span>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{item.subject}</td>
                        <td>{item.count.toLocaleString()}</td>
                        <td>{item.national}</td>
                        <td>{item.school}</td>
                        <td className="scoreChart__meCell">{item.me}</td>
                        {(onEdit || onRemove) && (
                          <td className="scoreChart__actions">
                            {onEdit && (
                              <button
                                className="scoreChart__editBtn"
                                onClick={() => startEdit(item)}
                                aria-label={`แก้ไขวิชา ${item.subject}`}
                              >
                                แก้ไข
                              </button>
                            )}
                            {onRemove && (
                              <button
                                className="scoreChart__delBtn"
                                onClick={() => onRemove(item.subject)}
                                aria-label={`ลบวิชา ${item.subject}`}
                              >
                                ลบ
                              </button>
                            )}
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx>{`
        .scoreChart {
          width: min(1140px, 100%);
          margin: 0 auto;
          padding: 28px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 28px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(248, 250, 252, 0.98) 100%
          );
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
        }

        /* Header */
        .scoreChart__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .scoreChart__heading { flex: 1; min-width: 240px; }
        .scoreChart__eyebrow {
          margin: 0 0 8px;
          color: #2f6fed;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .scoreChart__title {
          margin: 0;
          font-size: clamp(1.5rem, 3vw, 2.4rem);
          line-height: 1.1;
          color: #0f172a;
        }
        .scoreChart__desc {
          margin: 10px 0 0;
          color: #475569;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        /* Legend */
        .scoreChart__legend {
          min-width: 210px;
          padding: 16px 18px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(12px);
        }
        .scoreChart__legendRow {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #334155;
          font-size: 0.88rem;
          font-weight: 600;
        }
        .scoreChart__legendRow + .scoreChart__legendRow { margin-top: 10px; }
        .scoreChart__legendBar {
          display: inline-block;
          flex: 0 0 auto;
          border-radius: 4px;
        }
        .scoreChart__legendBar--national {
          width: 16px;
          height: 30px;
          background: rgba(148, 163, 184, 0.42);
          border: 1px solid rgba(100, 116, 139, 0.22);
        }
        .scoreChart__legendBar--school {
          width: 10px;
          height: 24px;
          background: #2f6fed;
        }
        .scoreChart__legendStar {
          width: 18px;
          height: 18px;
          display: inline-flex;
          color: #f7c948;
          filter: drop-shadow(0 0 6px rgba(247, 201, 72, 0.85));
        }
        .scoreChart__legendStar svg { width: 100%; height: 100%; }

        /* Plot */
        .scoreChart__plot { width: 100%; overflow-x: auto; padding-bottom: 4px; }

        /* Table */
        .scoreChart__tableWrap {
          margin-top: 20px;
          overflow-x: auto;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.86);
        }
        .scoreChart__table { width: 100%; border-collapse: collapse; }
        .scoreChart__table th,
        .scoreChart__table td {
          padding: 13px 16px;
          text-align: left;
          border-bottom: 1px solid rgba(226, 232, 240, 0.96);
          white-space: nowrap;
        }
        .scoreChart__table th {
          color: #475569;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          background: rgba(248, 250, 252, 0.96);
        }
        .scoreChart__table tbody tr:last-child td { border-bottom: none; }
        .scoreChart__table tbody tr:hover { background: rgba(241, 245, 249, 0.72); }
        .scoreChart__meCell { color: #b45309; font-weight: 800; }
        .scoreChart__actionsCol { width: 1%; white-space: nowrap; }
        .scoreChart__actions {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .scoreChart__editRow { background: rgba(239, 246, 255, 0.55); }
        .scoreChart__editRow td { padding-top: 8px; padding-bottom: 8px; }

        /* Cell inputs (inline edit) */
        .scoreChart__cellInput {
          width: 100%;
          min-width: 80px;
          padding: 5px 8px;
          border: 1.5px solid rgba(47, 111, 237, 0.45);
          border-radius: 7px;
          background: #fff;
          color: #0f172a;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .scoreChart__cellInput:focus {
          border-color: #2f6fed;
          box-shadow: 0 0 0 3px rgba(47, 111, 237, 0.15);
        }
        .scoreChart__cellInput--num { min-width: 72px; max-width: 90px; }
        .scoreChart__cellInput--me { border-color: rgba(180, 83, 9, 0.4); }
        .scoreChart__cellInput--me:focus { border-color: #b45309; box-shadow: 0 0 0 3px rgba(180,83,9,0.12); }

        /* Action buttons */
        .scoreChart__editBtn,
        .scoreChart__saveBtn,
        .scoreChart__cancelBtn,
        .scoreChart__delBtn {
          padding: 4px 11px;
          border-radius: 7px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .scoreChart__editBtn {
          border: 1px solid rgba(47, 111, 237, 0.35);
          background: rgba(239, 246, 255, 0.8);
          color: #2f6fed;
        }
        .scoreChart__editBtn:hover {
          background: rgba(219, 234, 254, 0.9);
          border-color: rgba(47, 111, 237, 0.6);
        }
        .scoreChart__saveBtn {
          border: 1px solid rgba(34, 197, 94, 0.45);
          background: rgba(240, 253, 244, 0.85);
          color: #15803d;
        }
        .scoreChart__saveBtn:hover {
          background: rgba(220, 252, 231, 0.95);
          border-color: rgba(34, 197, 94, 0.7);
        }
        .scoreChart__cancelBtn {
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: rgba(248, 250, 252, 0.85);
          color: #64748b;
        }
        .scoreChart__cancelBtn:hover {
          background: rgba(226, 232, 240, 0.9);
        }
        .scoreChart__delBtn {
          border: 1px solid rgba(239, 68, 68, 0.35);
          background: rgba(254, 242, 242, 0.7);
          color: #dc2626;
        }
        .scoreChart__delBtn:hover {
          background: rgba(254, 226, 226, 0.9);
          border-color: rgba(239, 68, 68, 0.6);
        }
        .scoreChart__editErr {
          color: #dc2626;
          font-size: 0.78rem;
          font-weight: 600;
        }

        /* Tooltip (global: rendered by recharts outside component DOM) */
        :global(.scoreTooltip) {
          padding: 12px 15px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 14px;
          color: #0f172a;
          background: rgba(255, 255, 255, 0.97);
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
          font-size: 0.88rem;
          line-height: 1.9;
        }
        :global(.scoreTooltip__title) {
          margin: 0 0 6px;
          font-size: 0.95rem;
          font-weight: 800;
        }
        :global(.scoreTooltip p) {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        :global(.scoreTooltip__dot) {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 2px;
          flex: 0 0 auto;
        }
        :global(.scoreTooltip__dot--national) { background: rgba(148,163,184,0.7); }
        :global(.scoreTooltip__dot--school)   { background: #2f6fed; }
        :global(.scoreTooltip__dot--me)       { background: #f7c948; }

        @media (max-width: 700px) {
          .scoreChart { padding: 18px; border-radius: 20px; }
          .scoreChart__header { flex-direction: column; }
          .scoreChart__legend { width: 100%; min-width: 0; }
        }
      `}</style>
    </>
  );
}
