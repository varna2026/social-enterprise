export default function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Интерактивна карта на социалните предприятия.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Североизточен район (Варна, Добрич, Шумен, Търговище)
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white border border-border inline-block"></span> Бяло</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block"></span> Зелено</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive inline-block"></span> Червено</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
