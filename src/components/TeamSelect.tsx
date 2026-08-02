import type { Team } from "@/types";

interface TeamSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  teams: Team[];
}

export function TeamSelect({ id, value, onChange, teams, disabled = false }: TeamSelectProps) {
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
