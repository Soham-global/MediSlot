// data: [{ label, sub, value, isToday }]
export default function BarChart({ data }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="bars" role="img" aria-label="Appointments over the next seven days">
      {data.map((item, index) => (
        <div key={item.label + item.sub} className="bar-col">
          <span className="bar-value">{item.value}</span>
          <div className="bar-track">
            <div
              className={`bar${item.isToday ? ' is-today' : ''}`}
              style={{
                height: `${Math.max((item.value / max) * 100, 3)}%`,
                animationDelay: `${index * 60}ms`,
              }}
              title={`${item.label} ${item.sub}: ${item.value}`}
            />
          </div>
          <span className="bar-label">
            {item.label}
            <small>{item.sub}</small>
          </span>
        </div>
      ))}
    </div>
  );
}
