{!showSetup && (
  <>
    {/* ✅ HEADER SELALU ADA */}
    <Header
      rate={rate}
      onRateChange={handleRateChange}
      onReset={handleReset}
      onPrint={handlePrint}
      onHelp={handleHelp}
      onLogout={handleLogout}
      totalLocal={totalLocal}
      totalIDR={totalIDR}
      mode={mode}
      onModeChange={setMode}
      region={region}
      onRegionChange={handleRegionChange}
    />

    {/* ✅ EDIT MODE */}
    {mode === "edit" && (
      <div className="screen-layout">
        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {hydrated ? (
            <TripInfoPanel tripInfo={tripInfo} onChange={setTripInfo} />
          ) : (
            <TripInfoSkeleton />
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              {hydrated ? (
                <ItineraryTable
                  rows={rows}
                  dayMap={dayMap}
                  region={region}
                  onUpdate={updateRow}
                  onAdd={addRow}
                  onDelete={deleteRow}
                  onInsertAbove={(id) => insertRowAt(id, "above")}
                  onInsertBelow={(id) => insertRowAt(id, "below")}
                />
              ) : (
                <TableSkeleton />
              )}
            </div>

            <div className="min-w-0">
              {hydrated ? (
                <ChartsPanel
                  rows={rows}
                  rate={rate}
                  totalLocal={totalLocal}
                  totalIDR={totalIDR}
                />
              ) : (
                <PanelSkeleton />
              )}
            </div>
          </div>

          <footer className="mt-10 border-t border-paper-line pt-5 pb-2 text-center text-[11px] text-ink-muted">
            Backpackervun Travel Planner · No accounts, no tracking · Your trip is saved in your browser ·{" "}
            <button
              type="button"
              onClick={() => {
                setHelpTab("contact");
                setHelpOpen(true);
              }}
              className="font-medium text-navy-500 underline-offset-2 hover:underline"
            >
              Contact us
            </button>
          </footer>
        </main>
      </div>
    )}

    {/* ✅ PREVIEW MODE */}
    {mode === "preview" && (
      <div className="print-layout">
        <div className="no-print relative z-30 border-b border-paper-line bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-3">
            <span className="text-xs text-gray-500">
              Preview Mode
            </span>

            <button
              onClick={() => setMode("edit")}
              className="px-3 py-1 text-sm border rounded"
            >
              Back
            </button>
          </div>
        </div>

        <div className="preview-frame">
          <PrintHeader
            totalLocal={totalLocal}
            totalIDR={totalIDR}
            region={region}
          />

          {hydrated && (
            <PrintLayout
              tripInfo={tripInfo}
              rows={rows}
              dayMap={dayMap}
              region={region}
              rate={rate}
              totalLocal={totalLocal}
              totalIDR={totalIDR}
            />
          )}
        </div>
      </div>
    )}
  </>
)}