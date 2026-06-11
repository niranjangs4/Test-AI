import React, { useEffect, useRef } from "react";
import { CheckCircle2, Play, Circle, Smartphone, StopCircle } from "lucide-react";

interface MaestroLiveReplayProps {
  currentStepIndex: number;
  isMobileRunning: boolean;
  onTriggerRun: () => void;
  onTriggerStop: () => void;
  mobileManualStopped: boolean;
  progress: number;
}

interface YAMLStep {
  lineNum: number;
  highlighted: boolean;
  indent: number;
  content: React.ReactNode;
}

export const MaestroLiveReplay: React.FC<MaestroLiveReplayProps> = ({
  currentStepIndex,
  isMobileRunning,
  onTriggerRun,
  onTriggerStop,
  mobileManualStopped,
  progress,
}) => {
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active line into view inside the terminal screen
  useEffect(() => {
    if (isMobileRunning && currentStepIndex >= 0 && activeStepRef.current && terminalBodyRef.current) {
      const activeEl = activeStepRef.current;
      const container = terminalBodyRef.current;

      const containerHeight = container.clientHeight;
      const activeTop = activeEl.offsetTop;
      const activeHeight = activeEl.clientHeight;

      // Scroll so the active step is in the middle of the terminal container
      container.scrollTo({
        top: activeTop - containerHeight / 2 + activeHeight / 2,
        behavior: "smooth",
      });
    }
  }, [currentStepIndex, isMobileRunning]);

  // Comprehensive step array mimicking the exact design snippet provided
  const steps: YAMLStep[] = [
    {
      lineNum: 1,
      highlighted: false,
      indent: 0,
      content: (
        <span>
          <span className="text-[#7b45c7]">appId</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">com.todoist</span>
        </span>
      ),
    },
    {
      lineNum: 2,
      highlighted: false,
      indent: 0,
      content: <span className="text-black/30">---</span>
    },
    {
      lineNum: 3,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">launchApp</span>
        </span>
      ),
    },
    {
      lineNum: 4,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Quick add</span>
        </span>
      ),
    },
    {
      lineNum: 5,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn: id</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">message</span>
        </span>
      ),
    },
    {
      lineNum: 6,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">inputText</span>
          <span className="text-black/30">: </span>
          <span className="text-[#19834e]">"go to the gym"</span>
        </span>
      ),
    },
    {
      lineNum: 7,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Date</span>
        </span>
      ),
    },
    {
      lineNum: 8,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Today</span>
        </span>
      ),
    },
    {
      lineNum: 9,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Add</span>
        </span>
      ),
    },
    {
      lineNum: 10,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">inputText</span>
          <span className="text-black/30">: </span>
          <span className="text-[#19834e]">"breakfast with John"</span>
        </span>
      ),
    },
    {
      lineNum: 11,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Date</span>
        </span>
      ),
    },
    {
      lineNum: 12,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Add time</span>
        </span>
      ),
    },
    {
      lineNum: 13,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">9 o'clock</span>
        </span>
      ),
    },
    {
      lineNum: 14,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">OK</span>
        </span>
      ),
    },
    {
      lineNum: 15,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Save</span>
        </span>
      ),
    },
    {
      lineNum: 16,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Add</span>
        </span>
      ),
    },
    {
      lineNum: 17,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">inputText</span>
          <span className="text-black/30">: </span>
          <span className="text-[#19834e]">"grocery shopping"</span>
        </span>
      ),
    },
    {
      lineNum: 18,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Add</span>
        </span>
      ),
    },
    {
      lineNum: 19,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">inputText</span>
          <span className="text-black/30">: </span>
          <span className="text-[#19834e]">"pick up the laundry"</span>
        </span>
      ),
    },
    {
      lineNum: 20,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Add</span>
        </span>
      ),
    },
    {
      lineNum: 21,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">inputText</span>
          <span className="text-black/30">: </span>
          <span className="text-[#19834e]">"Finalize editing of v3"</span>
        </span>
      ),
    },
    {
      lineNum: 22,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Priority</span>
        </span>
      ),
    },
    {
      lineNum: 23,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Priority 1</span>
        </span>
      ),
    },
    {
      lineNum: 24,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Add</span>
        </span>
      ),
    },
    {
      lineNum: 25,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">inputText</span>
          <span className="text-black/30">: </span>
          <span className="text-[#19834e]">"dinner at Emma's house"</span>
        </span>
      ),
    },
    {
      lineNum: 26,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Date</span>
        </span>
      ),
    },
    {
      lineNum: 27,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Add time</span>
        </span>
      ),
    },
    {
      lineNum: 28,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">7 o'clock</span>
        </span>
      ),
    },
    {
      lineNum: 29,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">30 minutes</span>
        </span>
      ),
    },
    {
      lineNum: 30,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">PM</span>
        </span>
      ),
    },
    {
      lineNum: 31,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">OK</span>
        </span>
      ),
    },
    {
      lineNum: 32,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Save</span>
        </span>
      ),
    },
    {
      lineNum: 33,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Add</span>
        </span>
      ),
    },
    {
      lineNum: 34,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn: id</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">toolbar</span>
        </span>
      ),
    },
    {
      lineNum: 35,
      highlighted: true,
      indent: 0,
      content: (
        <span>
          <span className="text-black/30">- </span>
          <span className="text-[#7b45c7]">tapOn</span>
          <span className="text-black/30">: </span>
          <span className="text-[#c77722]">Upcoming</span>
        </span>
      ),
    },
  ];

  // Helper info to display on the virtual phone viewport matching active workflow steps
  const getPhoneScreenContent = () => {
    if (!isMobileRunning || currentStepIndex < 3) {
      return {
        title: "Todoist Workspace",
        status: "Launch App Sandbox",
        items: [
          { text: "Read book", active: true },
          { text: "Renew gym membership", active: false }
        ],
        showInput: false,
        inputText: "",
        dateText: "",
        priority: 4,
      };
    }

    if (currentStepIndex >= 3 && currentStepIndex < 10) {
      return {
        title: "Todoist Worklist",
        status: currentStepIndex >= 9 ? "Added Task..." : "Typing Tasks...",
        items: [
          { text: "Read book", active: true },
          { text: "Renew gym membership", active: false },
          ...(currentStepIndex >= 8 ? [{ text: "go to the gym 📅 Today", active: false }] : [])
        ],
        showInput: currentStepIndex >= 4 && currentStepIndex < 9,
        inputText: currentStepIndex >= 6 ? "go to the gym" : "",
        dateText: currentStepIndex >= 8 ? "Today" : "",
        priority: 4,
      };
    }

    if (currentStepIndex >= 10 && currentStepIndex < 17) {
      return {
        title: "Todoist Worklist",
        status: currentStepIndex >= 16 ? "Saved Task..." : "Detailing Time...",
        items: [
          { text: "Read book", active: true },
          { text: "Renew gym membership", active: false },
          { text: "go to the gym 📅 Today", active: false },
          ...(currentStepIndex >= 15 ? [{ text: "breakfast with John ⏰ 9:00 AM", active: false }] : [])
        ],
        showInput: currentStepIndex >= 10 && currentStepIndex < 15,
        inputText: "breakfast with John",
        dateText: currentStepIndex >= 11 ? "Today, 9:00 AM" : "",
        priority: 4,
      };
    }

    if (currentStepIndex >= 17 && currentStepIndex < 21) {
      return {
        title: "Todoist Worklist",
        status: "Adding Quick Tasks...",
        items: [
          { text: "Read book", active: true },
          { text: "Renew gym membership", active: false },
          { text: "go to the gym 📅 Today", active: false },
          { text: "breakfast with John ⏰ 9:00 AM", active: false },
          ...(currentStepIndex >= 18 ? [{ text: "grocery shopping", active: false }] : []),
          ...(currentStepIndex >= 20 ? [{ text: "pick up the laundry", active: false }] : [])
        ],
        showInput: currentStepIndex === 17 || currentStepIndex === 19,
        inputText: currentStepIndex === 17 ? "grocery shopping" : "pick up the laundry",
        dateText: "",
        priority: 4,
      };
    }

    if (currentStepIndex >= 21 && currentStepIndex < 25) {
      return {
        title: "Todoist Worklist",
        status: "Setting Priority...",
        items: [
          { text: "Read book", active: true },
          { text: "Renew gym membership", active: false },
          { text: "go to the gym 📅 Today", active: false },
          { text: "breakfast with John ⏰ 9:00 AM", active: false },
          { text: "grocery shopping", active: false },
          { text: "pick up the laundry", active: false },
          ...(currentStepIndex >= 24 ? [{ text: "⚠️ Finalize editing of v3", active: false, highlight: true }] : [])
        ],
        showInput: currentStepIndex >= 21 && currentStepIndex < 24,
        inputText: "Finalize editing of v3",
        dateText: "",
        priority: currentStepIndex >= 23 ? 1 : 4,
      };
    }

    return {
      title: "Upcoming Schedule",
      status: "Task Playback Active",
      items: [
        { text: "Read book", active: true },
        { text: "Renew gym membership", active: false },
        { text: "go to the gym 📅 Today", active: false },
        { text: "breakfast with John ⏰ 9:00 AM", active: false },
        { text: "grocery shopping", active: false },
        { text: "pick up the laundry", active: false },
        { text: "⚠️ Finalize editing of v3", active: false, highlight: true },
        ...(currentStepIndex >= 32 ? [{ text: "dinner at Emma's house 📅 Tonight 7:30 PM", active: false }] : [])
      ],
      showInput: currentStepIndex >= 25 && currentStepIndex < 32,
      inputText: "dinner at Emma's house",
      dateText: "Tonight, 7:30 PM",
      priority: 4,
    };
  };

  const phoneContent = getPhoneScreenContent();

  return (
    <section className="flex flex-col items-center gap-4 md:gap-6 w-full py-8">
      <div className="text-center">
        <p className="text-xs font-mono tracking-widest text-[#1e63c8] bg-blue-50 px-3 py-1 rounded-full inline-block uppercase font-bold mb-1">
          Maestro Native Execution
        </p>
        <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight font-display font-sans">
          Maestro Declarative Mobile Agent in Action
        </h3>
      </div>

      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-[#FAF9F6] p-4 sm:p-6 lg:p-8 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Premium iOS/Android Device Frame Simulator */}
          <div className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative aspect-[1080/2220] w-full max-w-[300px] sm:max-w-[320px] overflow-hidden rounded-[40px] border-8 border-slate-900 bg-slate-950 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ring-4 ring-slate-850/10">
              
              {/* Dynamic Video Element if URL exists - with absolute interactive fallback */}
              <video
                className="absolute inset-0 h-full w-full object-cover z-0 pointer-events-none opacity-20"
                autoPlay
                muted
                playsInline
                loop
                preload="auto"
                disablePictureInPicture
                controlsList="nodownload noplaybackrate nofullscreen"
              >
                <source src="/replays/tmp-test/screen.mp4" type="video/mp4" />
              </video>

              {/* Dynamic Interactive UI Layer */}
              <div className="relative z-15 flex flex-col h-full bg-[#fbfaf8] text-slate-800 font-sans p-4 justify-between select-none">
                
                {/* Dynamic Status Bar */}
                <div className="flex justify-between items-center text-[10px] text-slate-600 font-semibold mb-2">
                  <span>9:41</span>
                  {/* Speaker pill notch */}
                  <div className="w-16 h-4 bg-slate-900 rounded-full mx-auto absolute top-1 left-1/2 -translate-x-1/2" />
                  <div className="flex items-center gap-1">
                    <span className="text-[8px]">5G</span>
                    <div className="w-4 h-2 bg-slate-650 bg-slate-600 rounded-sm inline-block relative border border-slate-600">
                      <span className="absolute left-0 top-0 bottom-0 bg-slate-600 w-3/4" />
                    </div>
                  </div>
                </div>

                {/* Simulated App Screen Workspace */}
                <div className="flex-1 flex flex-col overflow-hidden pt-2">
                  
                  {/* App Header */}
                  <div className="flex items-center justify-between border-b pb-2 mb-3 border-slate-100">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-sans">{phoneContent.title}</h4>
                      <p className="text-[10px] text-slate-400 font-sans leading-none">{phoneContent.status}</p>
                    </div>
                    <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold">TODOIST</span>
                  </div>

                  {/* App Todo List */}
                  <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                    {phoneContent.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all duration-300 ${
                          item.highlight 
                            ? "bg-red-50 border-red-200 text-red-900 font-medium"
                            : "bg-white border-slate-100 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            item.active ? "bg-[#1e63c8] border-[#1e63c8]" : "border-slate-300"
                          }`}>
                            {item.active && <span className="w-1.5 h-1.5 bg-white rounded-full block" />}
                          </div>
                          <span className={item.active ? "line-through text-slate-400" : ""}>{item.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Task Quick Sheets Model */}
                  {phoneContent.showInput && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-md mt-auto mb-2 space-y-2 animate-slide-up">
                      <p className="text-[9px] font-bold text-[#1e63c8] uppercase font-sans">Quick Task Composer</p>
                      <input
                        type="text"
                        readOnly
                        value={phoneContent.inputText}
                        className="w-full text-xs p-1.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 font-sans font-medium"
                      />
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-blue-600 font-medium font-sans">📅 {phoneContent.dateText || "Date unset"}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          phoneContent.priority === 1 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          P{phoneContent.priority}
                        </span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom Bar pill */}
                <div className="w-24 h-1 bg-slate-400 rounded-full mx-auto mt-2" />
              </div>

            </div>
          </div>

          {/* Right Column: Code Playback Script Viewer */}
          <div className="col-span-1 lg:col-span-6 flex flex-col justify-between overflow-hidden rounded-2xl border border-black/10 bg-[#fbfaf8] shadow-md h-[400px] sm:h-[440px] lg:h-[500px]">
            
            {/* Playback Header controls */}
            <div className="flex items-center gap-2 border-b border-black/5 bg-[#f4f2ef] px-4 py-3">
              <img src="/replays/tmp-test/icon.svg" alt="" className="size-5 shrink-0 rounded-[5px] border border-slate-200 bg-white" />
              <div className="min-w-0">
                <span className="block font-mono text-xs font-semibold text-[#252525] leading-none">Add Tasks.yaml</span>
                <span className="text-[9.5px] text-slate-450 text-slate-550 font-mono">YAML Spec</span>
              </div>

              {/* Status Tags */}
              {isMobileRunning ? (
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-[#e8f0fb] text-[#1e63c8]">
                  <svg className="size-3 animate-spin text-[#1e63c8]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  Running
                </span>
              ) : mobileManualStopped ? (
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 animate-pulse">
                  Override Stop
                </span>
              ) : currentStepIndex >= 35 ? (
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Passed
                </span>
              ) : (
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-150">
                  Ready
                </span>
              )}

              {/* Toggle controls */}
              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                {!isMobileRunning ? (
                  <button
                    type="button"
                    onClick={onTriggerRun}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-[#1e63c8] hover:bg-[#154ea3] text-white rounded-lg font-bold font-sans transition-all cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5 fill-white" />
                    RUN
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onTriggerStop}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold font-sans transition-all cursor-pointer"
                  >
                    <StopCircle className="w-2.5 h-2.5" />
                    HALT
                  </button>
                )}
              </div>
            </div>

            {/* YAML Body Viewport */}
            <div
              ref={terminalBodyRef}
              className="relative min-h-0 flex-1 overflow-y-auto py-3 font-mono text-[11px] sm:text-xs leading-[1.6] bg-[#fbfaf8] scrollbar-thin"
            >
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = isMobileRunning && currentStepIndex === stepNum;
                const isExecuted = currentStepIndex > stepNum;

                return (
                  <div
                    key={stepNum}
                    ref={isActive ? activeStepRef : null}
                    className={`flex items-start gap-2 whitespace-pre px-4 transition-all duration-300 ${
                      isActive
                        ? "bg-blue-100/40 border-l-2 border-[#1e63c8] py-0.5 font-bold"
                        : isExecuted
                        ? "text-slate-600 opacity-90"
                        : "opacity-45"
                    }`}
                  >
                    {/* Tick / Spinner indicator margin */}
                    <span className="flex h-5 w-4 shrink-0 items-center justify-center">
                      {isActive ? (
                        <svg className="size-3 animate-spin text-[#1e63c8]" viewBox="0 0 24 24" fill="none">
                          <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : isExecuted ? (
                        <svg className="size-3 text-[#19834e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : step.highlighted ? (
                        <Circle className="size-1 text-slate-300 fill-slate-300" />
                      ) : (
                        <span className="w-1" />
                      )}
                    </span>

                    {/* Code Line Index */}
                    <span className="w-6 shrink-0 select-none text-right font-mono text-[10px] text-black/25">
                      {step.lineNum}
                    </span>

                    {/* Step Highlight Syntax Context */}
                    <span className="min-w-0 font-mono truncate">
                      {step.content}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Run Progress slider */}
            <div className="bg-[#f4f2ef] border-t border-black/5 p-3 flex items-center justify-between gap-4 font-mono text-[10px] text-slate-500">
              <span className="font-bold flex items-center gap-1 text-[#1e63c8]">
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                PLAYBACK: {progress}%
              </span>
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1e63c8] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-mono text-slate-400 font-semibold">
                {currentStepIndex >= 0 ? `${currentStepIndex}/35` : "IDLE"}
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
