import { teams } from "@/data/teams";

interface TeamSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TeamSelect({ id, value, onChange, disabled = false }: TeamSelectProps) {
  return (
    <div className="team-select">
      <label htmlFor={id}>Winnende team</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        <option value="">Kies een team…</option>
        {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
      </select>
    </div>
  );
}
