import fs from "fs";
export const dataLocation = "/data/data.json";

interface Data {
    timetableData: object;
    courseWarnings: any[];
    lastUpdated: number;
}

let data: Data = {
    timetableData: {},
    courseWarnings: [],
    lastUpdated: 0,
};

let timer: ReturnType<typeof setTimeout> | null = null;

const loadData = (eventType?: string) => {
    const f = () => {
        data = JSON.parse(fs.readFileSync(dataLocation, "utf8"));
        console.log(`Loaded data (written at ${data.lastUpdated}).`);
    };

    if (eventType) {
        if (timer != null) {
            clearTimeout(timer);
            timer = null;
        }

        timer = setTimeout(f, 5000);
    } else {
        f();
    }
};

fs.watch(dataLocation, loadData);

loadData();

export { data };
