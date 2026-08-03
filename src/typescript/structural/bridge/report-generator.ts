interface ReportContent {
  title: string;
  columns: string[];
  rows: Array<Array<string | number>>;
}

interface Exporter {
  export(content: ReportContent): void;
}

abstract class Report {
  constructor(protected readonly exporter: Exporter) {}
  abstract generateContent(): ReportContent;

  // template pattern
  export(): void {
    this.exporter.export(this.generateContent());
  }
}

const content: ReportContent = {
  title: "Sales Report",
  columns: ["Product", "Revenue"],
  rows: [
    ["Laptop", 120000],
    ["Phone", 80000],
  ],
};

class SalesReport extends Report {
  override generateContent(): ReportContent {
    return content;
  }
}

class UserBehaviorReport extends Report {
  override generateContent(): ReportContent {
    return content;
  }
}

class PdfExporter implements Exporter {
  export(content: ReportContent): void {
    console.log(`exporting ${content.title} as PDF`);
  }
}

class CsvExporter implements Exporter {
  export(content: ReportContent): void {
    console.log(`exporting ${content.title} as CSV`);
  }
}

const salesPdf = new SalesReport(new PdfExporter());

const usersCsv = new UserBehaviorReport(new CsvExporter());

salesPdf.export();

usersCsv.export();
