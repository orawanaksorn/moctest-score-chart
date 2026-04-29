'use client';

import { useState } from 'react';
import { ScoreChart, type Score } from '../components/score-chart';
import { CountChart } from '../components/count-chart';

const DEFAULT_SCORES: Score[] = [
  { subject: 'English',  national: 80, school: 72, me: 76, count: 1250 },
  { subject: 'Thai',     national: 84, school: 75, me: 70, count: 1180 },
  { subject: 'Math',     national: 68, school: 60, me: 60, count:  980 },
  { subject: 'Science',  national: 78, school: 81, me: 88, count: 1050 },
];

type FormState = {
  subject: string;
  national: string;
  school: string;
  me: string;
  count: string;
};

const EMPTY_FORM: FormState = {
  subject: '',
  national: '',
  school: '',
  me: '',
  count: '',
};

export default function Page() {
  const [scores, setScores] = useState<Score[]>(DEFAULT_SCORES);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  function setField(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setError('');
    };
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const subject = form.subject.trim();
    if (!subject) {
      setError('กรุณากรอกชื่อวิชา');
      return;
    }
    if (scores.some((s) => s.subject === subject)) {
      setError(`วิชา "${subject}" มีอยู่แล้ว`);
      return;
    }
    if (
      form.national === '' || form.school === '' ||
      form.me === '' || form.count === ''
    ) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    setScores((prev) => [
      ...prev,
      {
        subject,
        national: Number(form.national) || 0,
        school:   Number(form.school)   || 0,
        me:       Number(form.me)       || 0,
        count:    Number(form.count)    || 0,
      },
    ]);
    setForm(EMPTY_FORM);
    setError('');
  }

  function removeSubject(subject: string) {
    setScores((prev) => prev.filter((s) => s.subject !== subject));
  }

  function editSubject(oldSubject: string, updated: Score) {
    setScores((prev) =>
      prev.map((s) => (s.subject === oldSubject ? updated : s))
    );
  }

  return (
    <main className="pageShell">
      <ScoreChart data={scores} onRemove={removeSubject} onEdit={editSubject} />

      <CountChart data={scores} />

      {/* ---- Add subject form ---- */}
      <div className="addCard">
        <h2 className="addCard__title">เพิ่มวิชา</h2>
        <form className="addCard__form" onSubmit={handleAdd} noValidate>
          <label className="addCard__field addCard__field--wide">
            <span className="addCard__label">ชื่อวิชา</span>
            <input
              className="addCard__input"
              type="text"
              placeholder="เช่น ประวัติศาสตร์"
              value={form.subject}
              onChange={setField('subject')}
            />
          </label>

          <label className="addCard__field">
            <span className="addCard__label">จำนวนคน</span>
            <input
              className="addCard__input"
              type="number"
              placeholder="เช่น 1200"
              value={form.count}
              onChange={setField('count')}
            />
          </label>

          <label className="addCard__field">
            <span className="addCard__label">คะแนนประเทศ</span>
            <input
              className="addCard__input"
              type="number"
              placeholder="0 – 100"
              value={form.national}
              onChange={setField('national')}
            />
          </label>

          <label className="addCard__field">
            <span className="addCard__label">คะแนนโรงเรียน</span>
            <input
              className="addCard__input"
              type="number"
              placeholder="0 – 100"
              value={form.school}
              onChange={setField('school')}
            />
          </label>

          <label className="addCard__field">
            <span className="addCard__label">คะแนนของฉัน</span>
            <input
              className="addCard__input"
              type="number"
              placeholder="0 – 100"
              value={form.me}
              onChange={setField('me')}
            />
          </label>

          <button className="addCard__btn" type="submit">
            + เพิ่มวิชา
          </button>
        </form>

        {error && <p className="addCard__error">{error}</p>}
      </div>

      <style jsx>{`
        .addCard {
          width: min(1140px, 100%);
          margin: 24px auto 0;
          padding: 24px 28px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 24px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.97) 0%,
            rgba(248, 250, 252, 0.97) 100%
          );
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
        }

        .addCard__title {
          margin: 0 0 18px;
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }

        .addCard__form {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: flex-end;
        }

        .addCard__field {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1 1 130px;
        }

        .addCard__field--wide {
          flex: 2 1 180px;
        }

        .addCard__label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .addCard__input {
          padding: 9px 12px;
          border: 1.5px solid rgba(148, 163, 184, 0.35);
          border-radius: 10px;
          background: rgba(248, 250, 252, 0.9);
          color: #0f172a;
          font-size: 0.95rem;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          width: 100%;
        }

        .addCard__input:focus {
          border-color: #2f6fed;
          box-shadow: 0 0 0 3px rgba(47, 111, 237, 0.15);
          background: #fff;
        }

        .addCard__btn {
          padding: 10px 22px;
          border: none;
          border-radius: 10px;
          background: #2f6fed;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
          align-self: flex-end;
          height: 40px;
        }

        .addCard__btn:hover { background: #1d55cc; }
        .addCard__btn:active { transform: scale(0.97); }

        .addCard__error {
          margin: 12px 0 0;
          color: #dc2626;
          font-size: 0.88rem;
          font-weight: 600;
        }

        @media (max-width: 600px) {
          .addCard { padding: 18px; border-radius: 18px; }
          .addCard__form { flex-direction: column; }
          .addCard__field,
          .addCard__field--wide { flex: none; width: 100%; }
          .addCard__btn { width: 100%; }
        }
      `}</style>
    </main>
  );
}
