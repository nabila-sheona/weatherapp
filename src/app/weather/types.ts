// app/weather/types.ts

export interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  coord: { lat: number; lon: number };
  main: { temp: number; feels_like: number; humidity: number };
  weather: Weather[];
  name: string;
}

export interface ForecastHourly {
  dt: number;
  temp: number;
  weather: Weather[];
}

export interface ForecastDaily {
  dt: number;
  temp: { day: number };
  weather: Weather[];
}

export interface ForecastData {
  hourly: ForecastHourly[];
  daily: ForecastDaily[];
}
