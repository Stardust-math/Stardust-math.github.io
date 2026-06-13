// ================================
// Course Type Tags (manual config)
// ================================
// NOTE:
// - Types are NOT tied to the course number alone; you can define them per semester.
// - Key format: "<semesterId>|<courseCode>"
//   e.g. "sophomore-first|STAT2002.06": "Major" | "Minor" | "Micro-minor" | "TA"
// - Any missing entry will fall back to "Major".
window.SCHEDULE_DEFAULT_COURSE_TYPE = "Major";
window.SCHEDULE_COURSE_TYPE_BY_KEY = window.SCHEDULE_COURSE_TYPE_BY_KEY || {
  "sophomore-second|011044.02": "Minor",
  "sophomore-second|CS2502A.01": "Minor",
  "junior-first|006196.01": "Minor",
  "junior-first|210706.01": "Minor",
  "junior-second|011103.02": "Minor",
  "junior-second|011145.02": "Minor",
  "junior-second|011174.01": "Minor",
  "junior-second|CS2002.03": "Minor",
  "junior-second|CS4017.01": "Minor",
  "junior-summer|CS4029.01": "Minor",
  "junior-first|Null": "Micro-minor",
  "junior-second|Null": "Micro-minor",
  "junior-second|EE3502.01": "TA",
  "junior-first|STAT2002.06": "TA",
};

(function () {
  const mount = document.getElementById("mount-schedule") || document.body;
  mount.insertAdjacentHTML("beforeend", `
  <div id="schedule">
    <button id="toggle-btn-schedule">
      <span><i class="fas fa-sun"></i></span>
    </button>
    <div id="clock-schedule">GMT+8 00:00</div>
    <div class="container">
      <div class="schedule-heading">My Schedule</div>
      
      <div class="schedule-container">
        <div class="schedule-switcher">
          <!-- My Timetable button -->
          <button class="schedule-switch-btn active" data-view="my-timetable">My Timetable</button>
          <!-- USTC Timetable button -->
          <button class="schedule-switch-btn" data-view="ustc-timetable">USTC Timetable</button>
          <button class="schedule-switch-btn" data-view="timetable">Timetable</button>
          <button class="schedule-switch-btn" data-view="calendar">Calendar</button>
        </div>
        
        <!-- My Timetable Section -->
        <div class="schedule-section active" id="my-timetable-section">
          <div class="semester-selector">
            <div class="semester-dropdown">
              <button class="semester-dropdown-btn">
                Select Semester <i class="fas fa-caret-down"></i>
              </button>
              <div class="semester-dropdown-content">
                <a href="#" data-semester="freshman-first">Freshman Year - First Semester (2023 Fall)</a>
                <a href="#" data-semester="freshman-second">Freshman Year - Second Semester (2024 Spring)</a>
                <a href="#" data-semester="freshman-summer">Freshman Year - Mini Semester (2024 Summer)</a>
                <a href="#" data-semester="sophomore-first">Sophomore Year - First Semester (2024 Fall)</a>
                <a href="#" data-semester="sophomore-second">Sophomore Year - Second Semester (2025 Spring)</a>
                <a href="#" data-semester="sophomore-summer">Sophomore Year - Mini Semester (2025 Summer)</a>
                <a href="#" data-semester="junior-first">Junior Year - First Semester (2025 Fall)</a>
                <a href="#" data-semester="junior-second">Junior Year - Second Semester (2026 Spring)</a>
                <a href="#" data-semester="junior-summer">Junior Year - Mini Semester (2026 Summer)</a>
                <a href="#" data-semester="senior-first">Senior Year - First Semester (2026 Fall)</a>
                <a href="#" data-semester="senior-second">Senior Year - Second Semester (2027 Spring)</a>
              </div>
            </div>
          </div>
          
          <!-- Freshman Year - First Semester -->
          <div class="semester-timetable-container active" id="freshman-first">
            <h3 class="semester-title">Freshman Year - First Semester (2023 Fall)</h3>
            <div class="timetable-container">
              <table class="timetable" id="freshman-first-timetable">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Period Number</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                    <th>Sunday</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Morning Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Morning</td>
                    <td class="period-number">1</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">FL1005.23 [2]</div>
                        <div class="course-name">English Reading & Writing I</div>
                        <div class="instructor">Jun Si</div>
                        <div class="location">2409</div>
                        <div class="weeks">2-4, 6-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">001356.02 [3]</div>
                        <div class="course-name">Foundation of Algebra</div>
                        <div class="instructor">Liming Ma</div>
                        <div class="location">5202</div>
                        <div class="weeks">2-4, 6-15, 17-18 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">MATH2002.02 [3]</div>
                        <div class="course-name">Foundations of Geometry</div>
                        <div class="instructor">Chen Zhao</div>
                        <div class="location">5202</div>
                        <div class="weeks">2-4, 6-17 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">FL1003.25 [2]</div>
                        <div class="course-name">English Communication I</div>
                        <div class="instructor">Tao Wang</div>
                        <div class="location">2304</div>
                        <div class="weeks">2-3, 6-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">FL1005.23 [2]</div>
                        <div class="course-name">English Reading & Writing I</div>
                        <div class="instructor">Jun Si</div>
                        <div class="location">2409</div>
                        <div class="weeks">5 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">FL1003.25 [2]</div>
                        <div class="course-name">English Communication I</div>
                        <div class="instructor">Tao Wang</div>
                        <div class="location">2304</div>
                        <div class="weeks">6 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">2</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">3</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH1001.01 [6]</div>
                        <div class="course-name">Mathematical Analysis (A1)</div>
                        <div class="instructor">Guangbin Ren</div>
                        <div class="location">5102</div>
                        <div class="weeks">2-4, 6-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH2002.02 [3]</div>
                        <div class="course-name">Foundations of Geometry</div>
                        <div class="instructor">Chen Zhao</div>
                        <div class="location">5202</div>
                        <div class="weeks">2-4, 6-17 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH1001.01 [6]</div>
                        <div class="course-name">Mathematical Analysis (A1)</div>
                        <div class="instructor">Guangbin Ren</div>
                        <div class="location">5102</div>
                        <div class="weeks">2, 4, 6, 7-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">001356.02 [3]</div>
                        <div class="course-name">Foundation of Algebra</div>
                        <div class="instructor">Liming Ma</div>
                        <div class="location">5202</div>
                        <div class="weeks">2-4, 6-17 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH1001.01 [6]</div>
                        <div class="course-name">Mathematical Analysis (A1)</div>
                        <div class="instructor">Guangbin Ren</div>
                        <div class="location">5102</div>
                        <div class="weeks">2-3, 6-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH1001.01 [6]</div>
                        <div class="course-name">Mathematical Analysis (A1)</div>
                        <div class="instructor">Guangbin Ren</div>
                        <div class="location">5102</div>
                        <div class="weeks">5 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH1001.01 [6]</div>
                        <div class="course-name">Mathematical Analysis (A1)</div>
                        <div class="instructor">Guangbin Ren</div>
                        <div class="location">5102</div>
                        <div class="weeks">6 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">4</td>
                  </tr>
                  <tr>
                    <td class="period-number">5</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Afternoon Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Afternoon</td>
                    <td class="period-number">6</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">PE00001.36 [1]</div>
                        <div class="course-name">Basic Sports</div>
                        <div class="instructor">Li Tang</div>
                        <div class="location">East Campus Track Field</div>
                        <div class="weeks">2-4, 6-18 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">CS1001A.11 [4]</div>
                        <div class="course-name">Computer Programming A</div>
                        <div class="instructor">Hu Si</div>
                        <div class="location">1101</div>
                        <div class="weeks">2-4, 6-16 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">MATH2801.01 [1]</div>
                        <div class="course-name">Elementary Seminar for Qiangji Class I</div>
                        <div class="instructor">Muxi Li</div>
                        <div class="location">5406</div>
                        <div class="weeks">2-4, 6-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">CS1001A.11 [4]</div>
                        <div class="course-name">Computer Programming A</div>
                        <div class="instructor">Hu Si</div>
                        <div class="location">1101</div>
                        <div class="weeks">2-3, 6-16 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">PE00001.36 [1]</div>
                        <div class="course-name">Basic Sports</div>
                        <div class="instructor">Li Tang</div>
                        <div class="location">East Campus Track Field</div>
                        <div class="weeks">5 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">CS1001A.11 [4]</div>
                        <div class="course-name">Computer Programming A</div>
                        <div class="instructor">Hu Si</div>
                        <div class="location">1101</div>
                        <div class="weeks">6 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">7</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">8</td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">MARX1012.06 [2.5]</div>
                        <div class="course-name">Ideology, Morality, and Rule of Law</div>
                        <div class="instructor">Hailong Liu, Xiao Han</div>
                        <div class="location">1302</div>
                        <div class="weeks">2-4, 6-17 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">MARX1014.08 [3]</div>
                        <div class="course-name">Introduction to Xi Jinping Thought on Socialism with Chinese Characteristics for a New Era</div>
                        <div class="instructor">Jinlong Li</div>
                        <div class="location">5104</div>
                        <div class="weeks">2-4, 6-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">MATH1001.01 [6]</div>
                        <div class="course-name">Mathematical Analysis (A1)</div>
                        <div class="instructor">Guangbin Ren</div>
                        <div class="location">5201</div>
                        <div class="weeks">3 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">HS1531.06 [2]</div>
                        <div class="course-name">Collegiate Psychology</div>
                        <div class="instructor">Xiaochu Zhang, Rujing Zha</div>
                        <div class="location">3C202</div>
                        <div class="weeks">2-3, 6-15 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">MARX1012.06 [2.5]</div>
                        <div class="course-name">Ideology, Morality, and Rule of Law</div>
                        <div class="instructor">Hailong Liu, Xiao Han</div>
                        <div class="location">1302</div>
                        <div class="weeks">5 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">HS1531.06 [2]</div>
                        <div class="course-name">Collegiate Psychology</div>
                        <div class="instructor">Xiaochu Zhang</div>
                        <div class="location">3C202</div>
                        <div class="weeks">6 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">9</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">10</td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Evening Section -->
                  <tr>
                    <td rowspan="3" class="period-header">Evening</td>
                    <td class="period-number">11</td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:05</div>
                      <div class="course-container">
                        <div class="course-number">FS1001.48 [1]</div>
                        <div class="course-name">Freshman Seminar</div>
                        <div class="instructor">Xinan Ma</div>
                        <div class="location">1101</div>
                        <div class="weeks">2 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="course-container">
                        <div class="course-number">CS1001A.11 [4]</div>
                        <div class="course-name">Computer Programming A</div>
                        <div class="instructor">Hu Si</div>
                        <div class="location">West Student Activity Center (2F) Computer Lab</div>
                        <div class="weeks">6-16 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">12</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">13</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- My Classes Table for Freshman First Semester -->
            <div class="my-classes-container">
              <h3 style="text-align: center; margin-top: 20px;">My Classes</h3>
              <table class="my-classes-table">
                <thead>
                  <tr>
                    <th>Course Number</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Time</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>HS1531.06</td>
                    <td>Collegiate Psychology</td>
                    <td>Xiaochu Zhang; Rujing Zha</td>
                    <td>5(8-10), 2-3,6-15 week(s);<br> 7(8-10), 6 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>001356.02</td>
                    <td>Foundation of Algebra</td>
                    <td>Liming Ma</td>
                    <td>2(1-2), 2-4,6-15,17-18 week(s);<br> 4(3-4), 2-4,6-17 week(s)</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>MATH2801.01</td>
                    <td>Elementary Seminar for Qiangji Class I</td>
                    <td>Muxi Li</td>
                    <td>4(6-7), 2-4,6-18 week(s)</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>MATH2002.02</td>
                    <td>Foundations of Geometry</td>
                    <td>Chen Zhao</td>
                    <td>4(1-2), 2-4,6-17 week(s);<br> 2(3-4), 2-4,6-17 week(s)</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>MATH1001.01</td>
                    <td>Mathematical Analysis (A1)</td>
                    <td>Guangbin Ren</td>
                    <td>1(3-4), 2-4,6-18 week(s);<br> 3(3-4), 2,4,6,7-18 week(s);<br> 5(3-4), 2-3,6-18 week(s);<br> 6(3-4), 5 week(s);<br> 7(3-4), 6 week(s);<br> 3(8-9), 3 week(s)</td>
                    <td>6</td>
                  </tr>
                  <tr>
                    <td>MARX1012.06</td>
                    <td>Ideology, Morality, and Rule of Law</td>
                    <td>Hailong Liu; Xiao Han</td>
                    <td>1(8-10), 2-4,6-17 week(s);<br> 6(8-10), 5 week(s)</td>
                    <td>2.5</td>
                  </tr>
                  <tr>
                    <td>CS1001A.11</td>
                    <td>Computer Programming A</td>
                    <td>Hu Si</td>
                    <td>3(6-7), 2-4,6-16 week(s);<br> 5(6-7), 2-3,6-16 week(s);<br> 7(6-7), 6 week(s);<br> 4(11-13), 6-16 week(s)</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>MIL1002.05</td>
                    <td>Military Skills</td>
                    <td>Xuan Liu</td>
                    <td>Null</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>MIL1001.05</td>
                    <td>Military Theory</td>
                    <td>Yangyang Fan</td>
                    <td>Null</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>FS1001.48</td>
                    <td>Freshman Seminar</td>
                    <td>Xinan Ma</td>
                    <td>3(11-12), 2 week(s)</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>MARX1014.08</td>
                    <td>Introduction to Xi Jinping Thought on Socialism with Chinese Characteristics for a New Era</td>
                    <td>Jinlong Li</td>
                    <td>2(8-10), 2-4,6-18 week(s)</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>PE00001.36</td>
                    <td>Basic Sports</td>
                    <td>Li Tang</td>
                    <td>1(6-7), 2-4,6-18 week(s);<br> 6(6-7), 5 week(s)</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>FL1003.25</td>
                    <td>English Communication I</td>
                    <td>Tao Wang</td>
                    <td>5(1-2), 2-3,6-18 week(s);<br> 7(1-2), 6 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>FL1005.23</td>
                    <td>English Reading & Writing I</td>
                    <td>Jun Si</td>
                    <td>1(1-2), 2-4,6-18 week(s);<br> 6(1-2), 5 week(s)</td>
                    <td>2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Freshman Year - Second Semester -->
          <div class="semester-timetable-container" id="freshman-second">
            <h3 class="semester-title">Freshman Year - Second Semester (2024 Spring)</h3>
            <div class="timetable-container">
              <table class="timetable" id="freshman-second-timetable">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Period Number</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                    <th>Sunday</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Morning Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Morning</td>
                    <td class="period-number">1</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">FL1006.07 [2]</div>
                        <div class="course-name">English Reading & Writing II</div>
                        <div class="instructor">Cheng Chen</div>
                        <div class="location">2404</div>
                        <div class="weeks">1-15, 17-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">MATH1004.01 [5]</div>
                        <div class="course-name">Linear Algebra (A1)</div>
                        <div class="instructor">Falai Chen</div>
                        <div class="location">5402</div>
                        <div class="weeks">1-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">PHYS1001B.09 [2.5]</div>
                          <div class="course-name">Mechanics B</div>
                          <div class="instructor">Rongde Lu, Yi Li</div>
                          <div class="location">3C102</div>
                          <div class="weeks">1-9, 11-12 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">PHYS1002B.09 [1.5]</div>
                          <div class="course-name">Thermotics B</div>
                          <div class="instructor">Rongde Lu, Yi Li</div>
                          <div class="location">3C102</div>
                          <div class="weeks">13-18 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">FL1004.06 [2]</div>
                        <div class="course-name">English Communication II</div>
                        <div class="instructor">Tao Wang</div>
                        <div class="location">2303</div>
                        <div class="weeks">1-5, 7-9, 11-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">PHYS1001B.09 [2.5]</div>
                        <div class="course-name">Mechanics B</div>
                        <div class="instructor">Rongde Lu, Yi Li</div>
                        <div class="location">3C102</div>
                        <div class="weeks">11 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">FL1004.06 [2]</div>
                        <div class="course-name">English Communication II</div>
                        <div class="instructor">Tao Wang</div>
                        <div class="location">2303</div>
                        <div class="weeks">7 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">2</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">3</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH1002.02 [6]</div>
                        <div class="course-name">Mathematical Analysis (A2)</div>
                        <div class="instructor">Luo Luo</div>
                        <div class="location">5201</div>
                        <div class="weeks">1-15, 17-18 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">MATH1002.02 [6]</div>
                          <div class="course-name">Mathematical Analysis (A2)</div>
                          <div class="instructor">Luo Luo</div>
                          <div class="location">1301</div>
                          <div class="weeks">16-17 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">MATH1002.02</div>
                          <div class="course-name">Mathematical Analysis (A2)</div>
                          <div class="instructor">Luo Luo</div>
                          <div class="location">5201</div>
                          <div class="weeks">1-9, 11-15, 18 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH1004.01 [5]</div>
                        <div class="course-name">Linear Algebra (A1)</div>
                        <div class="instructor">Falai Chen</div>
                        <div class="location">5402</div>
                        <div class="weeks">1-5, 7-9, 11-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH1002.02 [6]</div>
                        <div class="course-name">Mathematical Analysis (A2)</div>
                        <div class="instructor">Luo Luo</div>
                        <div class="location">5201</div>
                        <div class="weeks">1-5, 7-9, 11-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH1002.02</div>
                        <div class="course-name">Mathematical Analysis (A2)</div>
                        <div class="instructor">Luo Luo</div>
                        <div class="location">5201</div>
                        <div class="weeks">11 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">MATH1004.01 [5]</div>
                          <div class="course-name">Linear Algebra (A1)</div>
                          <div class="instructor">Falai Chen</div>
                          <div class="location">5402</div>
                          <div class="weeks">10 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">MATH1002.02 [6]</div>
                          <div class="course-name">Mathematical Analysis (A2)</div>
                          <div class="instructor">Luo Luo</div>
                          <div class="location">5201</div>
                          <div class="weeks">7 week(s)</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">4</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">5</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell">
                      <div class="time-info start-info">11:25</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">MATH1004.01 [5]</div>
                        <div class="course-name">Linear Algebra (A1)</div>
                        <div class="instructor">Falai Chen</div>
                        <div class="location">5402</div>
                        <div class="weeks">10 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Afternoon Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Afternoon</td>
                    <td class="period-number">6</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">PE00130w.01 [1]</div>
                        <div class="course-name">Free Combat I</div>
                        <div class="instructor">Da Li</div>
                        <div class="location">Central Campus Gymnasium</div>
                        <div class="weeks">1-5, 7-9, 11-18 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">PE00130w.01 [1]</div>
                        <div class="course-name">Free Combat I</div>
                        <div class="instructor">Da Li</div>
                        <div class="location">Central Campus Gymnasium</div>
                        <div class="weeks">10 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">7</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">8</td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">FL1502.01 [1]</div>
                        <div class="course-name">English Oral Practice (Elementary)</div>
                        <div class="instructor">Thomas Yifang Xiao</div>
                        <div class="location">2204</div>
                        <div class="weeks">1-8 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">MARX1010.11 [2.5]</div>
                        <div class="course-name">An Outline of Modern and Contemporary Chinese History</div>
                        <div class="instructor">Guimin Fan</div>
                        <div class="location">1101</div>
                        <div class="weeks">1-5, 7-9, 11-16 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">PHYS1001B.09 [2.5]</div>
                          <div class="course-name">Mechanics B</div>
                          <div class="instructor">Rongde Lu, Yi Li</div>
                          <div class="location">3C102</div>
                          <div class="weeks">1-5, 7-9, 11-12 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">PHYS1002B.09 [1.5]</div>
                          <div class="course-name">Thermotics B</div>
                          <div class="instructor">Rongde Lu, Yi Li</div>
                          <div class="location">3C102</div>
                          <div class="weeks">13-18 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">PHYS1001B.09 [2.5]</div>
                          <div class="course-name">Mechanics B</div>
                          <div class="instructor">Rongde Lu, Yi Li</div>
                          <div class="location">3C102</div>
                          <div class="weeks">7 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">MARX1010.11 [2.5]</div>
                          <div class="course-name">An Outline of Modern and Contemporary Chinese History</div>
                          <div class="instructor">Guimin Fan</div>
                          <div class="location">1101</div>
                          <div class="weeks">10 week(s)</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">9</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">10</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell">
                      <div class="time-info start-info">17:35</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">PHYS1002B.09 [1.5]</div>
                        <div class="course-name">Thermotics B</div>
                        <div class="instructor">Rongde Lu, Yi Li</div>
                        <div class="location">3C102</div>
                        <div class="weeks">13-18 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell">
                      <div class="time-info start-info">17:35</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">MARX1010.11 [2.5]</div>
                        <div class="course-name">An Outline of Modern and Contemporary Chinese History</div>
                        <div class="instructor">Guimin Fan</div>
                        <div class="location">1101</div>
                        <div class="weeks">10 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Evening Section -->
                  <tr>
                    <td rowspan="3" class="period-header">Evening</td>
                    <td class="period-number">11</td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:05</div>
                      <div class="course-container">
                        <div class="course-number">ESS1513.01 [1]</div>
                        <div class="course-name">Meteorology and Photography</div>
                        <div class="instructor">Yunfei Fu</div>
                        <div class="location">5201</div>
                        <div class="weeks">2-9, 11, 13 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="course-container">
                        <div class="course-number">PHYS1008B.08 [1]</div>
                        <div class="course-name">College Physics - Base Experimentation B</div>
                        <div class="instructor">……</div>
                        <div class="location">First Teaching Building</div>
                        <div class="weeks">3-5, 7-9, 11-16 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="course-container">
                        <div class="course-number">MATH2802.01 [1]</div>
                        <div class="course-name">Elementary Seminar for Qiangji Class II</div>
                        <div class="instructor">Muxi Li</div>
                        <div class="location">5307</div>
                        <div class="weeks">2-4, 7-9, 11-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:05</div>
                      <div class="course-container">
                        <div class="course-number">ESS1513.01 [1]</div>
                        <div class="course-name">Meteorology and Photography</div>
                        <div class="instructor">Yunfei Fu</div>
                        <div class="location">5201</div>
                        <div class="weeks">11 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">PHYS1008B.08 [1]</div>
                          <div class="course-name">College Physics - Base Experimentation B</div>
                          <div class="instructor">……</div>
                          <div class="location">First Teaching Building</div>
                          <div class="weeks">10 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">MATH2802.01 [1]</div>
                          <div class="course-name">Elementary Seminar for Qiangji Class II</div>
                          <div class="instructor">Muxi Li</div>
                          <div class="location">5307</div>
                          <div class="weeks">7 week(s)</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">12</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">13</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="course-container">
                        <div class="course-number">MATH2802.01 [1]</div>
                        <div class="course-name">Elementary Seminar for Qiangji Class II</div>
                        <div class="instructor">Muxi Li</div>
                        <div class="location">5307</div>
                        <div class="weeks">2, 14, 18 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- My Classes Table for Freshman Second Semester -->
            <div class="my-classes-container">
              <h3 style="text-align: center; margin-top: 20px;">My Classes</h3>
              <table class="my-classes-table">
                <thead>
                  <tr>
                    <th>Course Number</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Time</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PHYS1001B.09</td>
                    <td>Mechanics B</td>
                    <td>Rongde Lu; Yi Li</td>
                    <td>3(1-2), 1-9,11-12 week(s);<br> 5(8-9), 1-5,7-9,11-12 week(s);<br> 6(1-2), 11 week(s);<br> 7(8-9), 7 week(s)</td>
                    <td>2.5</td>
                  </tr>
                  <tr>
                    <td>PHYS1002B.09</td>
                    <td>Thermotics B</td>
                    <td>Rongde Lu; Yi Li</td>
                    <td>3(1-2), 13-18 week(s);<br> 5(8-10), 13-18 week(s)</td>
                    <td>1.5</td>
                  </tr>
                  <tr>
                    <td>MATH2802.01</td>
                    <td>Elementary Seminar for Qiangji Class II</td>
                    <td>Muxi Li</td>
                    <td>5(11-12), 2-4,7-9,11-18 week(s);<br> 5(13), 2,14,18 week(s);<br> 7(11-12), 7 week(s);<br> 7(13), 7 week(s)</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>MATH1002.02</td>
                    <td>Mathematical Analysis (A2)</td>
                    <td>Luo Luo</td>
                    <td>1(3-4), 1-15,17-18 week(s);<br> 3(3-4), 1-9,11-18 week(s);<br> 5(3-4), 1-5,7-9,11-18 week(s);<br> 6(3-4), 11 week(s);<br> 7(3-4), 7 week(s)</td>
                    <td>6</td>
                  </tr>
                  <tr>
                    <td>MARX1005.18</td>
                    <td>Practice on Chinese Important Thoughts</td>
                    <td>Null</td>
                    <td>Null</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>MARX1010.11</td>
                    <td>An Outline of Modern and Contemporary Chinese History</td>
                    <td>Guimin Fan</td>
                    <td>4(8-10), 1-5,7-9,11-16 week(s);<br> 7(8-10), 10 week(s)</td>
                    <td>2.5</td>
                  </tr>
                  <tr>
                    <td>PE00130w.01</td>
                    <td>Free Combat I</td>
                    <td>Da Li</td>
                    <td>4(6-7), 1-5,7-9,11-18 week(s);<br> 7(6-7), 10 week(s)</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>PHYS1008B.08</td>
                    <td>College Physics - Base Experimentation B</td>
                    <td>……</td>
                    <td>4(11-13), 3-5,7-9,11-16 week(s)</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>FL1502.01</td>
                    <td>English Oral Practice (Elementary)</td>
                    <td>Thomas Yifang Xiao</td>
                    <td>2(8-9), 1-8 week(s)</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>FL1004.06</td>
                    <td>English Communication II</td>
                    <td>Tao Wang</td>
                    <td>5(1-2), 1-5,7-9,11-18 week(s);<br> 7(1,2), 7 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>FL1006.07</td>
                    <td>English Reading & Writing II</td>
                    <td>Cheng Chen</td>
                    <td>1(1-2), 1-15,17-18 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>MATH1004.01</td>
                    <td>Linear Algebra (A1)</td>
                    <td>Falai Chen</td>
                    <td>2(1-2), 1-18 week(s);<br> 4(3-5), 1-5, 7-9, 11-18 week(s);<br> 7(3-5), 10 week(s)</td>
                    <td>5</td>
                  </tr>
                  <tr>
                    <td>FS1001.6C</td>
                    <td>Freshman Seminar</td>
                    <td>Xinan Ma</td>
                    <td>Null</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>ESS1513.01</td>
                    <td>Meteorology and Photography</td>
                    <td>Yunfei Fu</td>
                    <td>3(11-12), 2-9,11,13 week(s);<br> 6(11-12), 11 week(s)</td>
                    <td>1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Freshman Year - Mini Semester -->
          <div class="semester-timetable-container" id="freshman-summer">
            <h3 class="semester-title">Freshman Year - Mini Semester (2024 Summer)</h3>
            <div class="timetable-container">
              <table class="timetable" id="freshman-summer-timetable">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Period Number</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                    <th>Sunday</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Morning Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Morning</td>
                    <td class="period-number">1</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">2</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">3</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">4</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">5</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Afternoon Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Afternoon</td>
                    <td class="period-number">6</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">7</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">8</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">9</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">10</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Evening Section -->
                  <tr>
                    <td rowspan="3" class="period-header">Evening</td>
                    <td class="period-number">11</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">12</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">13</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- My Classes Table for Freshman Mini Semester -->
            <div class="my-classes-container">
              <h3 style="text-align: center; margin-top: 20px;">My Classes</h3>
              <table class="my-classes-table">
                <thead>
                  <tr>
                    <th>Course Number</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Time</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Sophomore Year - First Semester -->
          <div class="semester-timetable-container" id="sophomore-first">
            <h3 class="semester-title">Sophomore Year - First Semester (2024 Fall)</h3>
            <div class="timetable-container">
              <table class="timetable" id="sophomore-first-timetable">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Period Number</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                    <th>Sunday</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Morning Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Morning</td>
                    <td class="period-number">1</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">MATH1005.01 [4]</div>
                        <div class="course-name">Linear Algebra (A2)</div>
                        <div class="instructor">Falai Chen</div>
                        <div class="location">5302</div>
                        <div class="weeks">1-2, 4-5, 7-18 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">MATH1003.01 [4]</div>
                        <div class="course-name">Mathematical Analysis (A3)</div>
                        <div class="instructor">Dafeng Zuo</div>
                        <div class="location">5302</div>
                        <div class="weeks">1-4, 6-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">PHYS1004B.02 [4]</div>
                        <div class="course-name">Electromagnetism B</div>
                        <div class="instructor">Chunkai Xu</div>
                        <div class="location">5303</div>
                        <div class="weeks">1-4, 6-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">MATH1005.01 [4]</div>
                        <div class="course-name">Linear Algebra (A2)</div>
                        <div class="instructor">Falai Chen</div>
                        <div class="location">5302</div>
                        <div class="weeks">2 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">2</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">3</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH3012.02 [4]</div>
                        <div class="course-name">Introduction to Differential Equations</div>
                        <div class="instructor">Lifeng Zhao</div>
                        <div class="location">5302</div>
                        <div class="weeks">1-2, 4-5, 7-15, 17-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH1003.01 [4]</div>
                        <div class="course-name">Mathematical Analysis (A3)</div>
                        <div class="instructor">Dafeng Zuo</div>
                        <div class="location">5302</div>
                        <div class="weeks">1-2, 4, 6, 7-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH1005.01 [4]</div>
                        <div class="course-name">Linear Algebra (A2)</div>
                        <div class="instructor">Falai Chen</div>
                        <div class="location">5302</div>
                        <div class="weeks">1-4, 6-17 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">STAT2002.06 [3]</div>
                        <div class="course-name">Probability Theory and Mathematical Statistics</div>
                        <div class="instructor">Shuguang Zhang</div>
                        <div class="location">5102</div>
                        <div class="weeks">1-4, 6-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">MATH1005.01 [4]</div>
                          <div class="course-name">Linear Algebra (A2)</div>
                          <div class="instructor">Falai Chen</div>
                          <div class="location">5302</div>
                          <div class="weeks">6 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">MATH3012.02 [4]</div>
                          <div class="course-name">Introduction to Differential Equations</div>
                          <div class="instructor">Lifeng Zhao</div>
                          <div class="location">5302</div>
                          <div class="weeks">2 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH1003.01 [4]</div>
                        <div class="course-name">Mathematical Analysis (A3)</div>
                        <div class="instructor">Dafeng Zuo</div>
                        <div class="location">5302</div>
                        <div class="weeks">5 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">4</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">5</td>
                    <td class="has-class event-cell">
                      <div class="time-info start-info">11:25</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">MATH3012.02 [4]</div>
                        <div class="course-name">Introduction to Differential Equations</div>
                        <div class="instructor">Lifeng Zhao</div>
                        <div class="location">5302</div>
                        <div class="weeks">14 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Afternoon Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Afternoon</td>
                    <td class="period-number">6</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">PHYS1004B.02 [4]</div>
                        <div class="course-name">Electromagnetism B</div>
                        <div class="instructor">Chunkai Xu</div>
                        <div class="location">5303</div>
                        <div class="weeks">1-4, 6-17 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">MATH3012.02 [4]</div>
                        <div class="course-name">Introduction to Differential Equations</div>
                        <div class="instructor">Lifeng Zhao</div>
                        <div class="location">5302</div>
                        <div class="weeks">1-4, 6-8, 10-18 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">PHYS1004B.02 [4]</div>
                        <div class="course-name">Electromagnetism B</div>
                        <div class="instructor">Chunkai Xu</div>
                        <div class="location">5303</div>
                        <div class="weeks">6 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">7</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">8</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">PE00127.06 [1]</div>
                        <div class="course-name">Swimming</div>
                        <div class="instructor">Wen Zeng</div>
                        <div class="location">Central Campus Swimming Pool</div>
                        <div class="weeks">1-2, 4-5, 7-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">001361.01 [2]</div>
                        <div class="course-name">Mathematical Software</div>
                        <div class="instructor">Na Zhang</div>
                        <div class="location">5102</div>
                        <div class="weeks">1-2, 4, 6, 7-14 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">MARX1011.11 [2.5]</div>
                        <div class="course-name">Fundamentals of Marxism</div>
                        <div class="instructor">Xu Zhang</div>
                        <div class="location">5302</div>
                        <div class="weeks">1-4, 6-16 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">PE00127.06 [1]</div>
                        <div class="course-name">Swimming</div>
                        <div class="instructor">Wen Zeng</div>
                        <div class="location">Central Campus Swimming Pool</div>
                        <div class="weeks">2 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">001361.01 [2]</div>
                        <div class="course-name">Mathematical Software</div>
                        <div class="instructor">Na Zhang</div>
                        <div class="location">5102</div>
                        <div class="weeks">5 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">9</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">10</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Evening Section -->
                  <tr>
                    <td rowspan="3" class="period-header">Evening</td>
                    <td class="period-number">11</td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="course-container">
                        <div class="course-number">PHYS1009B.04 [0.5]</div>
                        <div class="course-name">College Physics - Comprehensive Experimentation B</div>
                        <div class="instructor">……</div>
                        <div class="location">First Teaching Building</div>
                        <div class="weeks">4, 6, 7-18 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="course-container">
                        <div class="course-number">PHYS1009B.04 [0.5]</div>
                        <div class="course-name">College Physics - Comprehensive Experimentation B</div>
                        <div class="instructor">……</div>
                        <div class="location">First Teaching Building</div>
                        <div class="weeks">5 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">12</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">13</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- My Classes Table for Sophomore First Semester -->
            <div class="my-classes-container">
              <h3 style="text-align: center; margin-top: 20px;">My Classes</h3>
              <table class="my-classes-table">
                <thead>
                  <tr>
                    <th>Course Number</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Time</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>MARX1011.11</td>
                    <td>Fundamentals of Marxism</td>
                    <td>Xu Zhang</td>
                    <td>4(8-10), 1-4,6-16 week(s)</td>
                    <td>2.5</td>
                  </tr>
                  <tr>
                    <td>PHYS1004B.02</td>
                    <td>Electromagnetism B</td>
                    <td>Chunkai Xu</td>
                    <td>5(1-2), 1-4,6-18 week(s);<br> 3(6-7), 1-4,6-17 week(s);<br> 6(6-7), 6 week(s)</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>001361.01</td>
                    <td>Mathematical Software</td>
                    <td>Na Zhang</td>
                    <td>2(8-10), 1-2,4,6,7-14 week(s);<br> 7(8-10), 5 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>MATH1005.01</td>
                    <td>Linear Algebra (A2)</td>
                    <td>Falai Chen</td>
                    <td>1(1-2), 1-2,4-5,7-18 week(s);<br> 3(3-4), 1-4,6-17 week(s);<br> 6(1-2), 2 week(s);<br> 6(3,4), 6 week(s)</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>MATH1003.01</td>
                    <td>Mathematical Analysis (A3)</td>
                    <td>Dafeng Zuo</td>
                    <td>4(1-2), 1-4,6-18 week(s);<br> 2(3-4), 1-2,4,6,7-18 week(s);<br> 7(3-4), 5 week(s)</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>MATH3012.02</td>
                    <td>Introduction to Differential Equations</td>
                    <td>Lifeng Zhao</td>
                    <td>1(3-4), 1-2,4-5,7-15,17-18 week(s);<br> 4(6-7), 1-4,6-8,10-18 week(s);<br> 1(5), 14 week(s);<br> 6(3-4), 2 week(s)</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>STAT2002.06</td>
                    <td>Probability Theory and Mathematical Statistics</td>
                    <td>Shuguang Zhang</td>
                    <td>5(3-5), 1-4,6-18 week(s)</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>PE00127.06</td>
                    <td>Swimming</td>
                    <td>Wen Zeng</td>
                    <td>1(8-9) 1-2,4-5,7-18 week(s);<br> 6(8-9), 2 week(s)</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>PHYS1009B.04</td>
                    <td>College Physics - Comprehensive Experimentation B</td>
                    <td>……</td>
                    <td>2(11-13), 4,6,7-18 week(s);<br> 7(11-13), 5 week(s)</td>
                    <td>0.5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Sophomore Year - Second Semester -->
          <div class="semester-timetable-container" id="sophomore-second">
            <h3 class="semester-title">Sophomore Year - Second Semester (2025 Spring)</h3>
            <div class="timetable-container">
              <table class="timetable" id="sophomore-second-timetable">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Period Number</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                    <th>Sunday</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Morning Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Morning</td>
                    <td class="period-number">1</td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">MATH3008.01 [3]</div>
                        <div class="course-name">Complex Variable</div>
                        <div class="instructor">Simin Li</div>
                        <div class="location">5401</div>
                        <div class="weeks">1-15 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">001702.01 [4]</div>
                        <div class="course-name">Real Analysis (H)</div>
                        <div class="instructor">Guangbin Ren</div>
                        <div class="location">5404</div>
                        <div class="weeks">1-16 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">PHYS1003B.14 [2]</div>
                          <div class="course-name">Optics B</div>
                          <div class="instructor">Peijun Yao</div>
                          <div class="location">5306</div>
                          <div class="weeks">1-8 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">PHYS1005B.02 [2]</div>
                          <div class="course-name">Atomic Physics B</div>
                          <div class="instructor">Peijun Yao</div>
                          <div class="location">5306</div>
                          <div class="weeks">9, 11, 12-16 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">2</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">3</td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">001702.01 [4]</div>
                        <div class="course-name">Real Analysis (H)</div>
                        <div class="instructor">Guangbin Ren</div>
                        <div class="location">5404</div>
                        <div class="weeks">1-10, 12-14, 16 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">PHYS1003B.14 [2]</div>
                          <div class="course-name">Optics B</div>
                          <div class="instructor">Peijun Yao</div>
                          <div class="location">5306</div>
                          <div class="weeks">1-8 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">PHYS1005B.02 [2]</div>
                          <div class="course-name">Atomic Physics B</div>
                          <div class="instructor">Peijun Yao</div>
                          <div class="location">5306</div>
                          <div class="weeks">9-16 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">MATH3007.02 [3]</div>
                        <div class="course-name">Probability Theory</div>
                        <div class="instructor">Dangzheng Liu</div>
                        <div class="location">5401</div>
                        <div class="weeks">1-12 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH3008.01 [3]</div>
                        <div class="course-name">Complex Variable</div>
                        <div class="instructor">Simin Li</div>
                        <div class="location">5401</div>
                        <div class="weeks">1-9, 11-15 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">4</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">5</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Afternoon Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Afternoon</td>
                    <td class="period-number">6</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">CS2502A.01 [4]</div>
                        <div class="course-name">Data Structures A</div>
                        <div class="instructor">Xiaohua Xu</div>
                        <div class="location">3B101</div>
                        <div class="weeks">1-9, 11-16 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">MATH3007.02 [3]</div>
                        <div class="course-name">Probability Theory</div>
                        <div class="instructor">Dangzheng Liu</div>
                        <div class="location">5401</div>
                        <div class="weeks">1-5, 7-9, 11-12 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">MATH3007.02 [3]</div>
                        <div class="course-name">Probability Theory</div>
                        <div class="instructor">Dangzheng Liu</div>
                        <div class="location">5401</div>
                        <div class="weeks">10 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">7</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">8</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">011044.02 [1]</div>
                        <div class="course-name">Introduction to Computer Science</div>
                        <div class="instructor">Guangzhong Sun</div>
                        <div class="location">2121</div>
                        <div class="weeks">1-10 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">MARX1013.02 [2.5]</div>
                          <div class="course-name">Introduction to Mao Zedong Thought and Theoretical System of Socialism with Chinese Characteristics</div>
                          <div class="instructor">Dongqing Wang</div>
                          <div class="location">2121</div>
                          <div class="weeks">1-16 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">CS2502A.01 [4]</div>
                          <div class="course-name">Data Structures A</div>
                          <div class="instructor">Xiaohua Xu</div>
                          <div class="location">3B101</div>
                          <div class="weeks">1-16 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">MNSC4004.01 [2]</div>
                        <div class="course-name">Social Media Analytics</div>
                        <div class="instructor">Xiaobei Shen, Qi Cheng</div>
                        <div class="location">2306</div>
                        <div class="weeks">1-9, 11-16 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">PE00139.06 [1]</div>
                        <div class="course-name">Outward Development II</div>
                        <div class="instructor">Yong Wang</div>
                        <div class="location">East Campus Track Field</div>
                        <div class="weeks">1-5, 7-9, 11-16 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">PE00139.06 [1]</div>
                          <div class="course-name">Outward Development II</div>
                          <div class="instructor">Yong Wang</div>
                          <div class="location">East Campus Track Field</div>
                          <div class="weeks">10 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">MATH3008.01 [3]</div>
                          <div class="course-name">Complex Variable</div>
                          <div class="instructor">Simin Li</div>
                          <div class="location">5401</div>
                          <div class="weeks">1-6, 8-9, 12-14 week(s)</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">9</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">10</td>
                    <td></td>
                    <td class="has-class event-cell">
                      <div class="time-info start-info">17:35</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">MARX1013.02 [2.5]</div>
                        <div class="course-name">Introduction to Mao Zedong Thought and Theoretical System of Socialism with Chinese Characteristics</div>
                        <div class="instructor">Dongqing Wang</div>
                        <div class="location">2121</div>
                        <div class="weeks">1-16 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell">
                      <div class="time-info start-info">17:35</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">MNSC4004.01 [2]</div>
                        <div class="course-name">Social Media Analytics</div>
                        <div class="instructor">Xiaobei Shen, Qi Cheng</div>
                        <div class="location">2306</div>
                        <div class="weeks">1-15 (odd) week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Evening Section -->
                  <tr>
                    <td rowspan="3" class="period-header">Evening</td>
                    <td class="period-number">11</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">12</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">13</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- My Classes Table for Sophomore Second Semester -->
            <div class="my-classes-container">
              <h3 style="text-align: center; margin-top: 20px;">My Classes</h3>
              <table class="my-classes-table">
                <thead>
                  <tr>
                    <th>Course Number</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Time</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>MARX1013.02</td>
                    <td>Introduction to Mao Zedong Thought and Theoretical System of Socialism with Chinese Characteristics</td>
                    <td>Dongqing Wang</td>
                    <td>2(8-10), 1-16 week(s)</td>
                    <td>2.5</td>
                  </tr>
                  <tr>
                    <td>PHYS1005B.02</td>
                    <td>Atomic Physics B</td>
                    <td>Peijun Yao</td>
                    <td>4(1-2), 9,11,12-16 week(s);<br> 2(3-5), 9-16 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>011044.02</td>
                    <td>Introduction to Computer Science</td>
                    <td>Guangzhong Sun</td>
                    <td>1(8-9), 1-10 week(s)</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>PHYS1003B.14</td>
                    <td>Optics B</td>
                    <td>Peijun Yao</td>
                    <td>4(1-2), 1-8 week(s);<br> 2(3-5), 1-8 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>001702.01</td>
                    <td>Real Analysis (H)</td>
                    <td>Guangbin Ren</td>
                    <td>3(1-2), 1-16 week(s);<br> 1(3-5), 1-10,12-14,16 week(s)</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>MATH3008.01</td>
                    <td>Complex Variable</td>
                    <td>Simin Li</td>
                    <td>2(1-2), 1-15 week(s);<br> 4(3-4), 1-9,11-15 week(s);<br> 7(8-9), 1-6,8-9,12-14 week(s)</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>PE00139.06</td>
                    <td>Outward Development II</td>
                    <td>Yong Wang</td>
                    <td>5(8-9), 1-5,7-9,11-16 week(s);<br> 7(8-9), 10 week(s)</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>MATH3007.02</td>
                    <td>Probability Theory</td>
                    <td>Dangzheng Liu</td>
                    <td>3(3-5), 1-12 week(s);<br> 5(6-7), 1-5,7-9,11-12 week(s);<br> 7(6-7), 10 week(s)</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>MNSC4004.01</td>
                    <td>Social Media Analytics</td>
                    <td>Xiaobei Shen; Qi Cheng</td>
                    <td>4(8-9), 1-9,11-16 week(s);<br> 4(10), 1-15 (odd) week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>MARX1503.01</td>
                    <td>History of Reform and Open-up</td>
                    <td>Hao Ding</td>
                    <td>Null</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>CS2502A.01</td>
                    <td>Data Structures A</td>
                    <td>Xiaohua Xu</td>
                    <td>4(6-7), 1-9,11-16 week(s);<br> 2(8-9), 1-16 week(s)</td>
                    <td>4</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Sophomore Year - Mini Semester -->
          <div class="semester-timetable-container" id="sophomore-summer">
            <h3 class="semester-title">Sophomore Year - Mini Semester (2025 Summer)</h3>
            <div class="timetable-container">
              <table class="timetable" id="sophomore-summer-timetable">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Period Number</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                    <th>Sunday</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Morning Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Morning</td>
                    <td class="period-number">1</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">2</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">3</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">4</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">5</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Afternoon Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Afternoon</td>
                    <td class="period-number">6</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">7</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">8</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">9</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">10</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Evening Section -->
                  <tr>
                    <td rowspan="3" class="period-header">Evening</td>
                    <td class="period-number">11</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">12</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">13</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- My Classes Table for Sophomore Mini Semester -->
            <div class="my-classes-container">
              <h3 style="text-align: center; margin-top: 20px;">My Classes</h3>
              <table class="my-classes-table">
                <thead>
                  <tr>
                    <th>Course Number</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Time</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Junior Year - First Semester -->
          <div class="semester-timetable-container" id="junior-first">
            <h3 class="semester-title">Junior Year - First Semester (2025 Fall)</h3>
            <div class="timetable-container">
              <table class="timetable" id="junior-first-timetable">
                <!-- Empty timetable structure same as freshman-second -->
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Period Number</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                    <th>Sunday</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Morning Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Morning</td>
                    <td class="period-number">1</td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">001108.01 [2]</div>
                        <div class="course-name">Mathematical Experiments</div>
                        <div class="instructor">Xinmao Wang</div>
                        <div class="location">2210</div>
                        <div class="weeks">1-3, 6-10 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">001108.01 [2]</div>
                        <div class="course-name">Mathematical Experiments</div>
                        <div class="instructor">Xinmao Wang</div>
                        <div class="location">2210</div>
                        <div class="weeks">5 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">2</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">3</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH3011.01 [3.5]</div>
                        <div class="course-name">Operations Research</div>
                        <div class="instructor">Shixiang Chen</div>
                        <div class="location">5504</div>
                        <div class="weeks">1-4, 6-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">006196.01 [2.5]</div>
                          <div class="course-name">Fundamentals of Multimedia Technology</div>
                          <div class="instructor">Nenghai Yu</div>
                          <div class="location">GH-206</div>
                          <div class="weeks">1-4, 7-7 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">006196.01</div>
                          <div class="course-name">Fundamentals of Multimedia Technology</div>
                          <div class="instructor">Xiaohui Chen</div>
                          <div class="location">GH-206</div>
                          <div class="weeks">8-14 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH3011.01 [3.5]</div>
                        <div class="course-name">Operations Research</div>
                        <div class="instructor">Shixiang Chen</div>
                        <div class="location">5504</div>
                        <div class="weeks">1-3, 6-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH3004.01 [3]</div>
                        <div class="course-name">Functional Analysis</div>
                        <div class="instructor">Congwen Liu</div>
                        <div class="location">2121</div>
                        <div class="weeks">1-3, 5-15 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">STAT2002.06 [3]</div>
                        <div class="course-name">Probability Theory and Mathematical Statistics (TA)</div>
                        <div class="instructor">Shuguang Zhang</div>
                        <div class="location">5104</div>
                        <div class="weeks">1-18 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH3011.01 [3.5]</div>
                        <div class="course-name">Operations Research</div>
                        <div class="instructor">Shixiang Chen</div>
                        <div class="location">5504</div>
                        <div class="weeks">5 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">MATH3004.01 [3]</div>
                        <div class="course-name">Functional Analysis</div>
                        <div class="instructor">Congwen Liu</div>
                        <div class="location">2121</div>
                        <div class="weeks">4 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">4</td>
                  </tr>
                  <tr>
                    <td class="period-number">5</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Afternoon Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Afternoon</td>
                    <td class="period-number">6</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">001108.01 [2]</div>
                        <div class="course-name">Mathematical Experiments</div>
                        <div class="instructor">Xinmao Wang</div>
                        <div class="location">2210</div>
                        <div class="weeks">1-4, 6-10 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">MATH3004.01 [3]</div>
                        <div class="course-name">Functional Analysis</div>
                        <div class="instructor">Congwen Liu</div>
                        <div class="location">2121</div>
                        <div class="weeks">1-4, 6-15 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">001125.01 [3]</div>
                        <div class="course-name">Numerical Algebra</div>
                        <div class="instructor">Yanzhi Song</div>
                        <div class="location">5504</div>
                        <div class="weeks">1-3, 5-12, 14-16 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">001125.01 [3]</div>
                        <div class="course-name">Numerical Algebra</div>
                        <div class="instructor">Yanzhi Song</div>
                        <div class="location">5504</div>
                        <div class="weeks">4 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">7</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">8</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">001125.01 [3]</div>
                        <div class="course-name">Numerical Algebra</div>
                        <div class="instructor">Yanzhi Song</div>
                        <div class="location">5504</div>
                        <div class="weeks">1-4, 6-17 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">HS1534.03 [2]</div>
                        <div class="course-name">Social Psychology</div>
                        <div class="instructor">Yingqiu Yang</div>
                        <div class="location">3A318</div>
                        <div class="weeks">1-4, 6-13 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">210706.01 [2]</div>
                        <div class="course-name">Introduction to Brain and Cognition Science</div>
                        <div class="instructor">Ao Li</div>
                        <div class="location">GT-B212</div>
                        <div class="weeks">1-3, 5-8, 10-14 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">HS1523.01 [2]</div>
                        <div class="course-name">The Beauty of Science</div>
                        <div class="instructor">Yan Liang</div>
                        <div class="location">5207</div>
                        <div class="weeks">1-3, 5-13 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">210706.01 [2]</div>
                        <div class="course-name">Introduction to Brain and Cognition Science</div>
                        <div class="instructor">Ao Li</div>
                        <div class="location">GT-B212</div>
                        <div class="weeks">4 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">9</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">10</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Evening Section -->
                  <tr>
                    <td rowspan="3" class="period-header">Evening</td>
                    <td class="period-number">11</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:05</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">HS1590.01 [2]]</div>
                          <div class="course-name">Four Treasures of the Study: Chinese Paper, Ink, Pen and Inkstone</div>
                          <div class="instructor">Shukun Tang</div>
                          <div class="location">2105</div>
                          <div class="weeks">1-2, 8, 12, 15-17 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">HS1590.01</div>
                          <div class="course-name">Four Treasures of the Study: Chinese Paper, Ink, Pen and Inkstone</div>
                          <div class="instructor">Bin Qian</div>
                          <div class="location">2105</div>
                          <div class="weeks">3-4 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">HS1590.01</div>
                          <div class="course-name">Four Treasures of the Study: Chinese Paper, Ink, Pen and Inkstone</div>
                          <div class="instructor">Biao Chen</div>
                          <div class="location">2105</div>
                          <div class="weeks">10-11 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="course-container">
                        <div class="course-number">AI3001.02 [4]</div>
                        <div class="course-name">Machine Learning A</div>
                        <div class="instructor">Xiaojun Chang</div>
                        <div class="location">GH-206</div>
                        <div class="weeks">10 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">AI3001.02 [4]</div>
                          <div class="course-name">Machine Learning A</div>
                          <div class="instructor">Zhihui Li</div>
                          <div class="location">GT-B112</div>
                          <div class="weeks">1-3, 5-8 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">AI3001.02</div>
                          <div class="course-name">Machine Learning A</div>
                          <div class="instructor">Xiaojun Chang</div>
                          <div class="location">GT-B112</div>
                          <div class="weeks">10-13, 15-16, 18 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="course-container">
                        <div class="course-number">AI3001.02 [4]</div>
                        <div class="course-name">Machine Learning A</div>
                        <div class="instructor">Xiaojun Chang</div>
                        <div class="location">GT-B212</div>
                        <div class="weeks">14 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="course-container">
                        <div class="course-number">AI3001.02 [4]</div>
                        <div class="course-name">Machine Learning A</div>
                        <div class="instructor">Zhihui Li</div>
                        <div class="location">GT-B112</div>
                        <div class="weeks">5 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">12</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">13</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- My Classes Table for Junior First Semester -->
            <div class="my-classes-container">
              <h3 style="text-align: center; margin-top: 20px;">My Classes</h3>
              <table class="my-classes-table">
                <thead>
                  <tr>
                    <th>Course Number</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Time</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>HS1523.01</td>
                    <td>The Beauty of Science</td>
                    <td>Yan Liang</td>
                    <td>5(8-10), 1-3, 5-13 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>HS1590.01</td>
                    <td>Four Treasures of the Study: Chinese Paper, Ink, Pen and Inkstone</td>
                    <td>Shukun Tang; Bin Qian; Biao Chen</td>
                    <td>1(11-12), 1-4,10-12,15-17 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>006196.01</td>
                    <td>Fundamentals of Multimedia Technology</td>
                    <td>Nenghai Yu; Xiaohui Chen</td>
                    <td>2(3-5), 1-4, 6-14 week(s)</td>
                    <td>2.5</td>
                  </tr>
                  <tr>
                    <td>210706.01</td>
                    <td>Introduction to Brain and Cognition Science</td>
                    <td>Ao Li</td>
                    <td>4(8-10), 1-3, 5-8, 10-14 week(s);<br> 7(8-10), 4 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>MARX1006.05</td>
                    <td>Situation and Policy</td>
                    <td>Xuxin Hu</td>
                    <td>Null</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>HS1534.03</td>
                    <td>Social Psychology</td>
                    <td>Yingqiu Yang</td>
                    <td>2(8-10), 1-4, 6-13 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>MATH3011.01</td>
                    <td>Operations Research</td>
                    <td>Shixiang Chen</td>
                    <td>1(3-4), 1-4, 6-18 week(s);<br> 3(3-4), 1-3, 6-18 week(s)</td>
                    <td>3.5</td>
                  </tr>
                  <tr>
                    <td>001125.01</td>
                    <td>Numerical Algebra</td>
                    <td>Yanzhi Song</td>
                    <td>1(8-9), 1-4, 6-17 week(s);<br> 4(6-7), 1-3, 5-12, 14-16 week(s);<br> 7(6-7), 4 week(s)</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>MATH3004.01</td>
                    <td>Functional Analysis</td>
                    <td>Congwen Liu</td>
                    <td>2(6-7), 1-4, 6-15 week(s);<br> 4(3-4), 1-3, 5-15 week(s);<br> 7(3-4), 4 week(s)</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>001108.01</td>
                    <td>Mathematical Experiments</td>
                    <td>Xinmao Wang</td>
                    <td>1(6-7), 1-4, 6-10 week(s);<br> 3(1-2), 1-3, 6-10 week(s);<br> 6(1-2), 5 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>AI3001.02</td>
                    <td>Machine Learning A</td>
                    <td>Xiaojun Chang; Zhihui Li</td>
                    <td>3(11-13), 10 week(s);<br> 4(11-13), 1-3, 5-8, 10-13, 15-16, 18 week(s);<br> 5(11-13), 14 week(s);<br> 6(11-13), 5 week(s)</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>STAT2002.06</td>
                    <td>Probability Theory and Mathematical Statistics (TA)</td>
                    <td>Shuguang Zhang</td>
                    <td>5(3-5), 1-18 week(s)</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>EDUS1001.33</td>
                    <td>Labor Education</td>
                    <td>Yi Xie</td>
                    <td>Null</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>Null</td>
                    <td>Introduction to Artificial Intelligence (AI+X Micro-minor Foundation Course)</td>
                    <td>Fei Wu</td>
                    <td>……</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>Null</td>
                    <td>Mathematical Foundations of AI (AI+X Micro-minor Foundation Course)</td>
                    <td>Zhengxing Huang; Junfei Dai</td>
                    <td>……</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>Null</td>
                    <td>AI Ethics and Security (AI+X Micro-minor Foundation Course)</td>
                    <td>Ziqi Yang</td>
                    <td>……</td>
                    <td>1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Junior Year - Second Semester -->
          <div class="semester-timetable-container" id="junior-second">
            <h3 class="semester-title">Junior Year - Second Semester (2026 Spring)</h3>
            <div class="timetable-container">
              <table class="timetable" id="junior-second-timetable">
                <!-- Empty timetable structure same as freshman-second -->
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Period Number</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                    <th>Sunday</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Morning Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Morning</td>
                    <td class="period-number">1</td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">011174.01 [4]</div>
                        <div class="course-name">Operating System</div>
                        <div class="instructor">Xianglan Chen</div>
                        <div class="location">3C304</div>
                        <div class="weeks">1-15 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">9:25</div>
                      <div class="course-container">
                        <div class="course-number">011103.02 [3]</div>
                        <div class="course-name">Algebraic Structure</div>
                        <div class="instructor">Hongli Xu</div>
                        <div class="location">3C202</div>
                        <div class="weeks">1-15 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">2</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">3</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">011174.01 [4]</div>
                        <div class="course-name">Operating System</div>
                        <div class="instructor">Xianglan Chen</div>
                        <div class="location">3C304</div>
                        <div class="weeks">1-5, 7-9, 11-15 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">CS2002.03 [2]</div>
                        <div class="course-name">Mathematical Logic</div>
                        <div class="instructor">Yi Zhou</div>
                        <div class="location">3B202</div>
                        <div class="weeks">1-9, 11-14 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">001139.01 [3]</div>
                        <div class="course-name">Mathematical Modeling</div>
                        <div class="instructor">Renjie Chen, Yumeng Liu</div>
                        <div class="location">5202</div>
                        <div class="weeks">1-14 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">001046.01 [3]</div>
                        <div class="course-name">Numerical Analysis</div>
                        <div class="instructor">Yan Xu, Yinhua Xia</div>
                        <div class="location">1201</div>
                        <div class="weeks">1-12 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">017144.07 [2]</div>
                        <div class="course-name">Stochastic Processes B</div>
                        <div class="instructor">Weiwei Zhuang</div>
                        <div class="location">3C204</div>
                        <div class="weeks">1-8, 10-16 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">9:45</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="course-container">
                        <div class="course-number">011174.01 [4]</div>
                        <div class="course-name">Operating System</div>
                        <div class="instructor">Xianglan Chen</div>
                        <div class="location">3C304</div>
                        <div class="weeks">10 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">4</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">5</td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="1">
                      <div class="time-info start-info">11:25</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">017144.07 [2]</div>
                        <div class="course-name">Stochastic Processes B</div>
                        <div class="instructor">Weiwei Zhuang</div>
                        <div class="location">3C204</div>
                        <div class="weeks">2-16 (even) week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Afternoon Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Afternoon</td>
                    <td class="period-number">6</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">011145.02 [4]</div>
                        <div class="course-name">Computer Organization</div>
                        <div class="instructor">Jianliang Lu, Junxia Zhang, Yanen Fan, Yanan Zhao</div>
                        <div class="location">3C202</div>
                        <div class="weeks">1-5, 7-9, 11-15 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">011103.02 [3]</div>
                        <div class="course-name">Algebraic Structure</div>
                        <div class="instructor">Hongli Xu</div>
                        <div class="location">3C202</div>
                        <div class="weeks">1-9, 12-15 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">011145.02 [4]</div>
                        <div class="course-name">Computer Organization</div>
                        <div class="instructor">Jianliang Lu, Junxia Zhang, Yanen Fan, Yanan Zhao</div>
                        <div class="location">3C202</div>
                        <div class="weeks">1-15 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">15:35</div>
                      <div class="course-container">
                        <div class="course-number">011145.02 [4]</div>
                        <div class="course-name">Computer Organization</div>
                        <div class="instructor">Jianliang Lu, Junxia Zhang, Yanen Fan, Yanan Zhao</div>
                        <div class="location">3C202</div>
                        <div class="weeks">10 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">7</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">8</td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">CS4017.01 [2]</div>
                          <div class="course-name">Introduction to Optimization</div>
                          <div class="instructor">Nick</div>
                          <div class="location">GT-B102</div>
                          <div class="weeks">1-5, 7-9, 11-14 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">EE3502.01 [3]</div>
                          <div class="course-name">Machine Learning B</div>
                          <div class="instructor">Li Xiao</div>
                          <div class="location">2405</div>
                          <div class="weeks">1-16 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">001046.01 [3]</div>
                        <div class="course-name">Numerical Analysis</div>
                        <div class="instructor">Yan Xu, Yinhua Xia</div>
                        <div class="location">1201</div>
                        <div class="weeks">1-9, 11-12 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">EE3502.01 [3]</div>
                        <div class="course-name">Machine Learning B</div>
                        <div class="instructor">Li Xiao</div>
                        <div class="location">2405</div>
                        <div class="weeks">1-16 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">BIO1509G.02 [2]</div>
                        <div class="course-name">Life Science: Human Microbiota and Health</div>
                        <div class="instructor">Guorong Zhang, Shu Zhu</div>
                        <div class="location">3A109</div>
                        <div class="weeks">2-8, 10-13 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">CS4017.01 [2]</div>
                        <div class="course-name">Introduction to Optimization</div>
                        <div class="instructor">Nick</div>
                        <div class="location">GT-B102</div>
                        <div class="weeks">10 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">15:55</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">011103.02 [3]</div>
                        <div class="course-name">Algebraic Structure</div>
                        <div class="instructor">Hongli Xu</div>
                        <div class="location">3C202</div>
                        <div class="weeks">5 week(s)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="period-number">9</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">10</td>
                    <td class="has-class event-cell" rowspan="1">
                      <div class="time-info start-info">17:35</div>
                      <div class="time-info end-info">18:20</div>
                      <div class="course-container">
                        <div class="course-number">CS4017.01 [2]</div>
                        <div class="course-name">Introduction to Optimization</div>
                        <div class="instructor">Nick</div>
                        <div class="location">GT-B102</div>
                        <div class="weeks">1-5, 7-9, 11-14 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Evening Section -->
                  <tr>
                    <td rowspan="3" class="period-header">Evening</td>
                    <td class="period-number">11</td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="course-container">
                        <div class="course-number">011145.02 [4]</div>
                        <div class="course-name">Computer Organization</div>
                        <div class="instructor">Jianliang Lu, Junxia Zhang, Yanen Fan, Yanan Zhao</div>
                        <div class="location">West Campus Electrical Building (3F) 406, 408</div>
                        <div class="weeks">1-5, 7-9, 11-15 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="course-container">
                        <div class="course-number">011174.01 [4]</div>
                        <div class="course-name">Operating System</div>
                        <div class="instructor">Xianglan Chen</div>
                        <div class="location">West Campus Electrical Building (3F) 406</div>
                        <div class="weeks">3-9, 11-12 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="course-container">
                        <div class="course-number">HS1648.01 [2]</div>
                        <div class="course-name">Public Affairs in Life</div>
                        <div class="instructor">Shanyong Wang, Huping Shang, Liang Wan</div>
                        <div class="location">5103</div>
                        <div class="weeks">2-14 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="2">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:05</div>
                      <div class="course-container">
                        <div class="course-number">HS1524.01 [1]</div>
                        <div class="course-name">History of Mind in Physics</div>
                        <div class="instructor">Ming Gong</div>
                        <div class="location">5202</div>
                        <div class="weeks">5, 7-15 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">19:30</div>
                      <div class="time-info end-info">21:55</div>
                      <div class="course-container">
                        <div class="course-number">011145.02 [4]</div>
                        <div class="course-name">Computer Organization</div>
                        <div class="instructor">Jianliang Lu, Junxia Zhang, Yanen Fan, Yanan Zhao</div>
                        <div class="location">West Campus Electrical Building (3F) 406, 408</div>
                        <div class="weeks">10 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">12</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">13</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- My Classes Table for Junior Second Semester -->
            <div class="my-classes-container">
              <h3 style="text-align: center; margin-top: 20px;">My Classes</h3>
              <table class="my-classes-table">
                <thead>
                  <tr>
                    <th>Course Number</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Time</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>HS1524.01</td>
                    <td>History of Mind in Physics</td>
                    <td>Ming Gong</td>
                    <td>4(11-12), 5, 7-15 week(s)</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>BIO1509G.02</td>
                    <td>Life Science: Human Microbiota and Health</td>
                    <td>Guorong Zhang; Shu Zhu</td>
                    <td>5(8-10), 2-8, 10-13 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>CS4017.01</td>
                    <td>Introduction to Optimization</td>
                    <td>Nick</td>
                    <td>1(8-10), 1-5, 7-9, 11-14 week(s);<br> 6(8-10), 10 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>011103.02</td>
                    <td>Algebraic Structure</td>
                    <td>Hongli Xu</td>
                    <td>2(6-7), 1-9, 12-15 week(s);<br> 4(1-2), 1-15 week(s);<br> 7(8-9), 5 week(s)</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>011145.02</td>
                    <td>Computer Organization</td>
                    <td>Jianliang Lu; Junxia Zhang; Yanen Fan; Yanan Zhao</td>
                    <td>1(6-7), 1-5, 7-9, 11-15 week(s);<br> 3(6-7), 1-15 week(s);<br> 1(11-13), 1-5, 7-9, 11-15 week(s);<br> 6(11-13), 10 week(s)</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>011174.01</td>
                    <td>Operating System</td>
                    <td>Xianglan Chen</td>
                    <td>1(3-4), 1-5, 7-9, 11-15 week(s);<br> 3(1-2), 1-15 week(s);<br> 2(11-13), 3-9, 11-12 week(s)</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>CS2002.03</td>
                    <td>Mathematical Logic</td>
                    <td>Yi Zhou</td>
                    <td>2(3-5), 1-9, 11-14 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>017144.07</td>
                    <td>Stochastic Processes B</td>
                    <td>Weiwei Zhuang</td>
                    <td>5(3-4), 1-8, 10-16 week(s);<br> 5(5), 2-16 (even) week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>001046.01</td>
                    <td>Numerical Analysis</td>
                    <td>Yan Xu; Yinhua Xia</td>
                    <td>2(8-9), 1-9, 11-12 week(s);<br> 4(3-5), 1-12 week(s)</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>001139.01</td>
                    <td>Mathematical Modeling</td>
                    <td>Renjie Chen; Yumeng Liu</td>
                    <td>3(3-5), 1-14 week(s)</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>EE3502.01</td>
                    <td>Machine Learning B</td>
                    <td>Li Xiao</td>
                    <td>1(8-9), 1-16 week(s);<br> 4(8-9), 1-16 week(s)</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>HS1648.01</td>
                    <td>Public Affairs in Life</td>
                    <td>Shanyong Wang; Huping Shang; Liang Wan</td>
                    <td>3(11-13), 2-14 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>HS1003.10</td>
                    <td>Art Practice</td>
                    <td>Yi Xie</td>
                    <td>Null</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>Null</td>
                    <td>Artificial Intelligence and Scientific Computing (AI+X Micro-minor Core Course)</td>
                    <td>Ying Wei</td>
                    <td>……</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>Null</td>
                    <td>Natural Language Processing (AI+X Micro-minor Core Course)</td>
                    <td>Siliang Tang</td>
                    <td>……</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>Null</td>
                    <td>Game Artificial Intelligence Practice (AI+X Micro-minor Practical Course)</td>
                    <td>Runze Wu</td>
                    <td>……</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>Null</td>
                    <td>Large Model Architecture and Practical Application of Multi-modal Technologies (AI+X Micro-minor Practical Course)</td>
                    <td>Liucheng Duan</td>
                    <td>……</td>
                    <td>1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Junior Year - Mini Semester -->
          <div class="semester-timetable-container" id="junior-summer">
            <h3 class="semester-title">Junior Year - Mini Semester (2026 Summer)</h3>
            <div class="timetable-container">
              <table class="timetable" id="junior-summer-timetable">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Period Number</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                    <th>Sunday</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Morning Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Morning</td>
                    <td class="period-number">1</td>
                    <td class="has-class event-cell" rowspan="1">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">8:35</div>
                      <div class="course-container">
                        <div class="course-number">001M06.01 [2]</div>
                        <div class="course-name">Advances in Computer Graphics</div>
                        <div class="instructor">Ligang Liu</div>
                        <div class="location">2321</div>
                        <div class="weeks">1 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="1">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">8:35</div>
                      <div class="course-container">
                        <div class="course-number">001M06.01 [2]</div>
                        <div class="course-name">Advances in Computer Graphics</div>
                        <div class="instructor">Ligang Liu</div>
                        <div class="location">2321</div>
                        <div class="weeks">1 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="1">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">8:35</div>
                      <div class="course-container">
                        <div class="course-number">001M06.01 [2]</div>
                        <div class="course-name">Advances in Computer Graphics</div>
                        <div class="instructor">Ligang Liu</div>
                        <div class="location">2321</div>
                        <div class="weeks">1 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="1">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">8:35</div>
                      <div class="course-container">
                        <div class="course-number">001M06.01 [2]</div>
                        <div class="course-name">Advances in Computer Graphics</div>
                        <div class="instructor">Ligang Liu</div>
                        <div class="location">2321</div>
                        <div class="weeks">1 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="1">
                      <div class="time-info start-info">7:50</div>
                      <div class="time-info end-info">8:35</div>
                      <div class="course-container">
                        <div class="course-number">001M06.01 [2]</div>
                        <div class="course-name">Advances in Computer Graphics</div>
                        <div class="instructor">Ligang Liu</div>
                        <div class="location">2321</div>
                        <div class="weeks">1 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">2</td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">8:40</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">001M06.01 [2]</div>
                          <div class="course-name">Advances in Computer Graphics</div>
                          <div class="instructor">Ligang Liu</div>
                          <div class="location">2321</div>
                          <div class="weeks">1 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">CS4029.01 [2]</div>
                          <div class="course-name">Innovative Practice Based on Domestic Computing Platform</div>
                          <div class="instructor">Hui Zhang</div>
                          <div class="location">West Campus Electrical Building (3F) 406</div>
                          <div class="weeks">2 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">8:40</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">001M06.01 [2]</div>
                          <div class="course-name">Advances in Computer Graphics</div>
                          <div class="instructor">Ligang Liu</div>
                          <div class="location">2321</div>
                          <div class="weeks">1 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">CS4029.01 [2]</div>
                          <div class="course-name">Innovative Practice Based on Domestic Computing Platform</div>
                          <div class="instructor">Hui Zhang</div>
                          <div class="location">West Campus Electrical Building (3F) 406</div>
                          <div class="weeks">2 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">8:40</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">001M06.01 [2]</div>
                          <div class="course-name">Advances in Computer Graphics</div>
                          <div class="instructor">Ligang Liu</div>
                          <div class="location">2321</div>
                          <div class="weeks">1 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">CS4029.01 [2]</div>
                          <div class="course-name">Innovative Practice Based on Domestic Computing Platform</div>
                          <div class="instructor">Hui Zhang</div>
                          <div class="location">West Campus Electrical Building (3F) 406</div>
                          <div class="weeks">2 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">8:40</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">001M06.01 [2]</div>
                          <div class="course-name">Advances in Computer Graphics</div>
                          <div class="instructor">Ligang Liu</div>
                          <div class="location">2321</div>
                          <div class="weeks">1 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">CS4029.01 [2]</div>
                          <div class="course-name">Innovative Practice Based on Domestic Computing Platform</div>
                          <div class="instructor">Hui Zhang</div>
                          <div class="location">West Campus Electrical Building (3F) 406</div>
                          <div class="weeks">2 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="3">
                      <div class="time-info start-info">8:40</div>
                      <div class="time-info end-info">11:20</div>
                      <div class="overlap-container">
                        <div class="overlap-course">
                          <div class="course-number">001M06.01 [2]</div>
                          <div class="course-name">Advances in Computer Graphics</div>
                          <div class="instructor">Ligang Liu</div>
                          <div class="location">2321</div>
                          <div class="weeks">1 week(s)</div>
                        </div>
                        <div class="overlap-course">
                          <div class="course-number">CS4029.01 [2]</div>
                          <div class="course-name">Innovative Practice Based on Domestic Computing Platform</div>
                          <div class="instructor">Hui Zhang</div>
                          <div class="location">West Campus Electrical Building (3F) 406</div>
                          <div class="weeks">2 week(s)</div>
                        </div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">3</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">4</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">5</td>
                    <td class="has-class event-cell" rowspan="1">
                      <div class="time-info start-info">11:25</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">CS4029.01 [2]</div>
                        <div class="course-name">Innovative Practice Based on Domestic Computing Platform</div>
                        <div class="instructor">Hui Zhang</div>
                        <div class="location">West Campus Electrical Building (3F) 406</div>
                        <div class="weeks">2 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="1">
                      <div class="time-info start-info">11:25</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">CS4029.01 [2]</div>
                        <div class="course-name">Innovative Practice Based on Domestic Computing Platform</div>
                        <div class="instructor">Hui Zhang</div>
                        <div class="location">West Campus Electrical Building (3F) 406</div>
                        <div class="weeks">2 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="1">
                      <div class="time-info start-info">11:25</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">CS4029.01 [2]</div>
                        <div class="course-name">Innovative Practice Based on Domestic Computing Platform</div>
                        <div class="instructor">Hui Zhang</div>
                        <div class="location">West Campus Electrical Building (3F) 406</div>
                        <div class="weeks">2 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="1">
                      <div class="time-info start-info">11:25</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">CS4029.01 [2]</div>
                        <div class="course-name">Innovative Practice Based on Domestic Computing Platform</div>
                        <div class="instructor">Hui Zhang</div>
                        <div class="location">West Campus Electrical Building (3F) 406</div>
                        <div class="weeks">2 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="1">
                      <div class="time-info start-info">11:25</div>
                      <div class="time-info end-info">12:10</div>
                      <div class="course-container">
                        <div class="course-number">CS4029.01 [2]</div>
                        <div class="course-name">Innovative Practice Based on Domestic Computing Platform</div>
                        <div class="instructor">Hui Zhang</div>
                        <div class="location">West Campus Electrical Building (3F) 406</div>
                        <div class="weeks">2 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Afternoon Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Afternoon</td>
                    <td class="period-number">6</td>
                    <td class="has-class event-cell" rowspan="4">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">001M06.01 [2]</div>
                        <div class="course-name">Advances in Computer Graphics</div>
                        <div class="instructor">Ligang Liu</div>
                        <div class="location">2321</div>
                        <div class="weeks">1 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="4">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">001M06.01 [2]</div>
                        <div class="course-name">Advances in Computer Graphics</div>
                        <div class="instructor">Ligang Liu</div>
                        <div class="location">2321</div>
                        <div class="weeks">1 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="4">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">001M06.01 [2]</div>
                        <div class="course-name">Advances in Computer Graphics</div>
                        <div class="instructor">Ligang Liu</div>
                        <div class="location">2321</div>
                        <div class="weeks">1 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="4">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">001M06.01 [2]</div>
                        <div class="course-name">Advances in Computer Graphics</div>
                        <div class="instructor">Ligang Liu</div>
                        <div class="location">2321</div>
                        <div class="weeks">1 week(s)</div>
                      </div>
                    </td>
                    <td class="has-class event-cell" rowspan="4">
                      <div class="time-info start-info">14:00</div>
                      <div class="time-info end-info">17:30</div>
                      <div class="course-container">
                        <div class="course-number">001M06.01 [2]</div>
                        <div class="course-name">Advances in Computer Graphics</div>
                        <div class="instructor">Ligang Liu</div>
                        <div class="location">2321</div>
                        <div class="weeks">1 week(s)</div>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">7</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">8</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">9</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">10</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Evening Section -->
                  <tr>
                    <td rowspan="3" class="period-header">Evening</td>
                    <td class="period-number">11</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">12</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">13</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- My Classes Table for Junior Mini Semester -->
            <div class="my-classes-container">
              <h3 style="text-align: center; margin-top: 20px;">My Classes</h3>
              <table class="my-classes-table">
                <thead>
                  <tr>
                    <th>Course Number</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Time</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>001M06.01</td>
                    <td>Advances in Computer Graphics</td>
                    <td>Ligang Liu</td>
                    <td>1(1-4; 6-9), 1 week(s);<br> 2(1-4; 6-9), 1 week(s);<br> 3(1-4; 6-9), 1 week(s);<br> 4(1-4; 6-9), 1 week(s);<br> 5(1-4; 6-9), 1 week(s)</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>CS4029.01</td>
                    <td>Innovative Practice Based on Domestic Computing Platform</td>
                    <td>Hui Zhang</td>
                    <td>1(2-5), 2 week(s);<br> 2(2-5), 2 week(s);<br> 3(2-5), 2 week(s);<br> 4(2-5), 2 week(s);<br> 5(2-5), 2 week(s)</td>
                    <td>2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Senior Year - First Semester -->
          <div class="semester-timetable-container" id="senior-first">
            <h3 class="semester-title">Senior Year - First Semester (2026 Fall)</h3>
            <div class="timetable-container">
              <table class="timetable" id="senior-first-timetable">
                <!-- Empty timetable structure same as freshman-second -->
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Period Number</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                    <th>Sunday</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Morning Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Morning</td>
                    <td class="period-number">1</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">2</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">3</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">4</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">5</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Afternoon Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Afternoon</td>
                    <td class="period-number">6</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">7</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">8</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">9</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">10</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Evening Section -->
                  <tr>
                    <td rowspan="3" class="period-header">Evening</td>
                    <td class="period-number">11</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">12</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">13</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- My Classes Table for Senior First Semester -->
            <div class="my-classes-container">
              <h3 style="text-align: center; margin-top: 20px;">My Classes</h3>
              <table class="my-classes-table">
                <thead>
                  <tr>
                    <th>Course Number</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Time</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- No classes in this semester -->
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Senior Year - Second Semester -->
          <div class="semester-timetable-container" id="senior-second">
            <h3 class="semester-title">Senior Year - Second Semester (2027 Spring)</h3>
            <div class="timetable-container">
              <table class="timetable" id="senior-second-timetable">
                <!-- Empty timetable structure same as freshman-second -->
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Period Number</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                    <th>Sunday</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Morning Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Morning</td>
                    <td class="period-number">1</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">2</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">3</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">4</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">5</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Afternoon Section -->
                  <tr>
                    <td rowspan="5" class="period-header">Afternoon</td>
                    <td class="period-number">6</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">7</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">8</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">9</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">10</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  
                  <!-- Evening Section -->
                  <tr>
                    <td rowspan="3" class="period-header">Evening</td>
                    <td class="period-number">11</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">12</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="period-number">13</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- My Classes Table for Senior Second Semester -->
            <div class="my-classes-container">
              <h3 style="text-align: center; margin-top: 20px;">My Classes</h3>
              <table class="my-classes-table">
                <thead>
                  <tr>
                    <th>Course Number</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Time</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- No classes in this semester -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- USTC Timetable Section -->
        <div class="schedule-section" id="ustc-timetable-section">
          <div class="ustc-local-save-hint">
            <i class="fas fa-info-circle"></i>
            <span>Your actions will be saved locally, allowing you to pick up right where you left off next time.</span>
          </div>
          <div class="timetable-container">
            <table class="timetable" id="ustc-timetable">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Period Number</th>
                  <th>Monday</th>
                  <th>Tuesday</th>
                  <th>Wednesday</th>
                  <th>Thursday</th>
                  <th>Friday</th>
                  <th>Saturday</th>
                  <th>Sunday</th>
                </tr>
              </thead>
              <tbody>
                <!-- Morning Section -->
                <tr>
                  <td rowspan="5" class="period-header">Morning</td>
                  <td class="period-number">1</td>
                  <td data-period="1" data-day="1"></td>
                  <td data-period="1" data-day="2"></td>
                  <td data-period="1" data-day="3"></td>
                  <td data-period="1" data-day="4"></td>
                  <td data-period="1" data-day="5"></td>
                  <td data-period="1" data-day="6"></td>
                  <td data-period="1" data-day="0"></td>
                </tr>
                <tr>
                  <td class="period-number">2</td>
                  <td data-period="2" data-day="1"></td>
                  <td data-period="2" data-day="2"></td>
                  <td data-period="2" data-day="3"></td>
                  <td data-period="2" data-day="4"></td>
                  <td data-period="2" data-day="5"></td>
                  <td data-period="2" data-day="6"></td>
                  <td data-period="2" data-day="0"></td>
                </tr>
                <tr>
                  <td class="period-number">3</td>
                  <td data-period="3" data-day="1"></td>
                  <td data-period="3" data-day="2"></td>
                  <td data-period="3" data-day="3"></td>
                  <td data-period="3" data-day="4"></td>
                  <td data-period="3" data-day="5"></td>
                  <td data-period="3" data-day="6"></td>
                  <td data-period="3" data-day="0"></td>
                </tr>
                <tr>
                  <td class="period-number">4</td>
                  <td data-period="4" data-day="1"></td>
                  <td data-period="4" data-day="2"></td>
                  <td data-period="4" data-day="3"></td>
                  <td data-period="4" data-day="4"></td>
                  <td data-period="4" data-day="5"></td>
                  <td data-period="4" data-day="6"></td>
                  <td data-period="4" data-day="0"></td>
                </tr>
                <tr>
                  <td class="period-number">5</td>
                  <td data-period="5" data-day="1"></td>
                  <td data-period="5" data-day="2"></td>
                  <td data-period="5" data-day="3"></td>
                  <td data-period="5" data-day="4"></td>
                  <td data-period="5" data-day="5"></td>
                  <td data-period="5" data-day="6"></td>
                  <td data-period="5" data-day="0"></td>
                </tr>
                
                <!-- Afternoon Section -->
                <tr>
                  <td rowspan="5" class="period-header">Afternoon</td>
                  <td class="period-number">6</td>
                  <td data-period="6" data-day="1"></td>
                  <td data-period="6" data-day="2"></td>
                  <td data-period="6" data-day="3"></td>
                  <td data-period="6" data-day="4"></td>
                  <td data-period="6" data-day="5"></td>
                  <td data-period="6" data-day="6"></td>
                  <td data-period="6" data-day="0"></td>
                </tr>
                <tr>
                  <td class="period-number">7</td>
                  <td data-period="7" data-day="1"></td>
                  <td data-period="7" data-day="2"></td>
                  <td data-period="7" data-day="3"></td>
                  <td data-period="7" data-day="4"></td>
                  <td data-period="7" data-day="5"></td>
                  <td data-period="7" data-day="6"></td>
                  <td data-period="7" data-day="0"></td>
                </tr>
                <tr>
                  <td class="period-number">8</td>
                  <td data-period="8" data-day="1"></td>
                  <td data-period="8" data-day="2"></td>
                  <td data-period="8" data-day="3"></td>
                  <td data-period="8" data-day="4"></td>
                  <td data-period="8" data-day="5"></td>
                  <td data-period="8" data-day="6"></td>
                  <td data-period="8" data-day="0"></td>
                </tr>
                <tr>
                  <td class="period-number">9</td>
                  <td data-period="9" data-day="1"></td>
                  <td data-period="9" data-day="2"></td>
                  <td data-period="9" data-day="3"></td>
                  <td data-period="9" data-day="4"></td>
                  <td data-period="9" data-day="5"></td>
                  <td data-period="9" data-day="6"></td>
                  <td data-period="9" data-day="0"></td>
                </tr>
                <tr>
                  <td class="period-number">10</td>
                  <td data-period="10" data-day="1"></td>
                  <td data-period="10" data-day="2"></td>
                  <td data-period="10" data-day="3"></td>
                  <td data-period="10" data-day="4"></td>
                  <td data-period="10" data-day="5"></td>
                  <td data-period="10" data-day="6"></td>
                  <td data-period="10" data-day="0"></td>
                </tr>
                
                <!-- Evening Section -->
                <tr>
                  <td rowspan="3" class="period-header">Evening</td>
                  <td class="period-number">11</td>
                  <td data-period="11" data-day="1"></td>
                  <td data-period="11" data-day="2"></td>
                  <td data-period="11" data-day="3"></td>
                  <td data-period="11" data-day="4"></td>
                  <td data-period="11" data-day="5"></td>
                  <td data-period="11" data-day="6"></td>
                  <td data-period="11" data-day="0"></td>
                </tr>
                <tr>
                  <td class="period-number">12</td>
                  <td data-period="12" data-day="1"></td>
                  <td data-period="12" data-day="2"></td>
                  <td data-period="12" data-day="3"></td>
                  <td data-period="12" data-day="4"></td>
                  <td data-period="12" data-day="5"></td>
                  <td data-period="12" data-day="6"></td>
                  <td data-period="12" data-day="0"></td>
                </tr>
                <tr>
                  <td class="period-number">13</td>
                  <td data-period="13" data-day="1"></td>
                  <td data-period="13" data-day="2"></td>
                  <td data-period="13" data-day="3"></td>
                  <td data-period="13" data-day="4"></td>
                  <td data-period="13" data-day="5"></td>
                  <td data-period="13" data-day="6"></td>
                  <td data-period="13" data-day="0"></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <button class="add-event-btn" id="add-ustc-event">
            <i class="fas fa-plus"></i> Add Class
          </button>
          
          <!-- USTC Classes List -->
          <div class="ustc-classes-container" id="ustc-classes-container">
            <h3 style="text-align: center; margin-top: 20px;">My Classes</h3>
            <table class="ustc-classes-table" id="ustc-classes-table">
              <thead>
                <tr>
                  <th>Period Range</th>
                  <th>Course Name</th>
                  <th>Instructor</th>
                  <th>Location</th>
                  <th>Weeks</th>
                  <th>Days</th>
                  <th>Credits</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="ustc-classes-body">
                <!-- Classes will be added here -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Timetable Section -->
        <div class="schedule-section" id="timetable-section">
          <div class="week-navigation">
            <button class="week-nav-btn" id="prev-week-btn">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="week-title" id="current-week">Week of Mon, Jan 1 - Sun, Jan 7</div>
            <button class="week-nav-btn" id="next-week-btn">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div class="timetable-container">
            <table class="timetable" id="timetable">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Monday</th>
                  <th>Tuesday</th>
                  <th>Wednesday</th>
                  <th>Thursday</th>
                  <th>Friday</th>
                  <th>Saturday</th>
                  <th>Sunday</th>
                </tr>
              </thead>
              <tbody id="timetable-body">
                <!-- Timetable rows will be generated by JavaScript -->
              </tbody>
            </table>
          </div>
          
          <button class="add-event-btn" id="add-timetable-event">
            <i class="fas fa-plus"></i> Add Class/Event
          </button>
        </div>

        <!-- Calendar Section -->
        <div class="schedule-section" id="calendar-section">
          <div id="calendar-container"></div>
          <button class="add-event-btn" id="add-calendar-event">
            <i class="fas fa-plus"></i> Add Event
          </button>
        </div>
      </div>
    </div>
    
    <a href="#" class="back-btn" id="schedule-back-btn">
      <i class="fas fa-arrow-left"></i>
    </a>
    
    <!-- Event Modal -->
    <div class="event-modal" id="event-modal">
      <div class="event-modal-content">
        <span class="event-modal-close" id="event-modal-close">&times;</span>
        <h3 class="event-modal-title" id="event-modal-title">Add New Class</h3>
        
        <form id="event-form">
          <input type="hidden" id="event-id">
          <input type="hidden" id="event-type">
          
          <div class="event-form-group">
            <label for="ustc-period-start">Period Start</label>
            <select id="ustc-period-start" class="event-form-control" required>
              <option value="1">1 (7:50-8:35)</option>
              <option value="2">2 (8:40-9:25)</option>
              <option value="3">3 (9:45-10:30)</option>
              <option value="4">4 (10:35-11:20)</option>
              <option value="5">5 (11:25-12:10)</option>
              <option value="6">6 (14:00-14:45)</option>
              <option value="7">7 (14:50-15:35)</option>
              <option value="8">8 (15:55-16:40)</option>
              <option value="9">9 (16:45-17:30)</option>
              <option value="10">10 (17:35-18:20)</option>
              <option value="11">11 (19:30-20:15)</option>
              <option value="12">12 (20:20-21:05)</option>
              <option value="13">13 (21:10-21:55)</option>
            </select>
          </div>
          
          <div class="event-form-group">
            <label for="ustc-period-end">Period End</label>
            <select id="ustc-period-end" class="event-form-control" required>
              <option value="1">1 (7:50-8:35)</option>
              <option value="2">2 (8:40-9:25)</option>
              <option value="3">3 (9:45-10:30)</option>
              <option value="4">4 (10:35-11:20)</option>
              <option value="5">5 (11:25-12:10)</option>
              <option value="6">6 (14:00-14:45)</option>
              <option value="7">7 (14:50-15:35)</option>
              <option value="8">8 (15:55-16:40)</option>
              <option value="9">9 (16:45-17:30)</option>
              <option value="10">10 (17:35-18:20)</option>
              <option value="11">11 (19:30-20:15)</option>
              <option value="12">12 (20:20-21:05)</option>
              <option value="13">13 (21:10-21:55)</option>
            </select>
          </div>
          
          <div class="event-form-group">
            <label for="ustc-course-name">Course Name</label>
            <input type="text" id="ustc-course-name" class="event-form-control" required>
          </div>
          
          <div class="event-form-group">
            <label for="ustc-instructor">Instructor</label>
            <input type="text" id="ustc-instructor" class="event-form-control" required>
          </div>
          
          <div class="event-form-group">
            <label for="ustc-location">Location</label>
            <input type="text" id="ustc-location" class="event-form-control" required>
          </div>
          
          <!-- Added Credits field -->
          <div class="event-form-group">
            <label for="ustc-credits">Credits</label>
            <input type="number" id="ustc-credits" class="event-form-control" required>
          </div>
          
          <div class="event-form-group">
            <label>Days</label>
            <div class="days-container">
              <label><input type="checkbox" name="ustc-day" value="1"> Mon</label>
              <label><input type="checkbox" name="ustc-day" value="2"> Tue</label>
              <label><input type="checkbox" name="ustc-day" value="3"> Wed</label>
              <label><input type="checkbox" name="ustc-day" value="4"> Thu</label>
              <label><input type="checkbox" name="ustc-day" value="5"> Fri</label>
              <label><input type="checkbox" name="ustc-day" value="6"> Sat</label>
              <label><input type="checkbox" name="ustc-day" value="0"> Sun</label>
            </div>
          </div>
          
          <div class="event-form-group weeks-container">
            <div class="weeks-title">Teaching Weeks (1-18)</div>
            <div class="weeks-grid" id="weeks-grid">
              <!-- Weeks checkboxes will be generated here -->
            </div>
            <div class="week-display" id="week-display"></div>
          </div>
          
          <div class="event-form-actions">
            <button type="button" class="event-form-btn event-form-btn-delete" id="event-delete-btn" style="display: none;">Delete</button>
            <button type="button" class="event-form-btn event-form-btn-cancel" id="event-cancel-btn">Cancel</button>
            <button type="submit" class="event-form-btn event-form-btn-save">Save</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- General event modal -->
    <div class="event-modal" id="general-event-modal">
      <div class="event-modal-content">
        <span class="event-modal-close" id="general-event-modal-close">&times;</span>
        <h3 class="event-modal-title" id="general-event-modal-title">Add New Event</h3>
        
        <form id="general-event-form">
          <input type="hidden" id="general-event-id">
          <input type="hidden" id="general-event-type">
          
          <div class="event-form-group">
            <label for="event-title">Event Title</label>
            <input type="text" id="event-title" class="event-form-control" required>
          </div>
          
          <div class="event-form-group">
            <label for="event-description">Description</label>
            <textarea id="event-description" class="event-form-control" rows="3"></textarea>
          </div>
          
          <div class="event-form-group">
            <label for="event-start">Start</label>
            <input type="datetime-local" id="event-start" class="event-form-control" required>
          </div>
          
          <div class="event-form-group">
            <label for="event-end">End</label>
            <input type="datetime-local" id="event-end" class="event-form-control" required>
          </div>
          
          <div class="event-form-group" id="recurring-container" style="display: none;">
            <label>
              <input type="checkbox" id="event-recurring"> Recurring Event
            </label>
          </div>
          
          <div class="event-form-actions">
            <button type="button" class="event-form-btn event-form-btn-delete" id="general-event-delete-btn" style="display: none;">Delete</button>
            <button type="button" class="event-form-btn event-form-btn-cancel" id="general-event-cancel-btn">Cancel</button>
            <button type="submit" class="event-form-btn event-form-btn-save">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
`);
})();
