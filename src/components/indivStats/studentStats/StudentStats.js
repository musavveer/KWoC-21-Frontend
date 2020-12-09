import React, { useState, useEffect } from 'react';
import Tag from './Tag';
import axios from 'axios';
import Navbar from '../../Navbar';
import Footer from '../../Footer';
import { BACKEND_URL,STATS_API } from '../../../constants/constants';
import './StudentStats.scss';
import '../../../components/dashboard/dashboard.scss'
import Projects from '../../../data/projects'
import { Component } from 'ag-grid-community';

function trim_message(message) {
  if(message != undefined)
    if (message.length > 40) return message.trim(0, 40) + '...';
    else return message;
}

function trim_lines(lines) {
  console.log('what is coming here',lines)
  let num_lines = parseInt(lines)
  if(num_lines > 1000)
    return  parseInt(num_lines/1000).toString() + 'K'
  else
    return lines
}

function fetch_calls(link) {
  return fetch(link, {
    headers: {
      'Authorization': 'token 710126db276b7f6b47013fa8426211bfe33c40dc'
    }
  })
            .then(res => res.json())
            .then(res => {
              return res
            })
            .catch(err => {
              return err
            })
}
export default function NewStudentDashboard() {
  const [fullName, setFullName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [username, setUsername] = useState('')
  const [projects, setProjectName] = useState([
    // {
    //   Name: 'darkHorse',
    //   RepoLink: 'https://github.com/kossiitkgp/darkHorse',
    //   owner: 'kossiitkgp',
    // },
    // {
    //   Name: 'todxpy',
    //   RepoLink: 'https://github.com/xypnox/todxpy',
    //   owner: 'xypnox',
    // },
    // {
    //   Name: 'KWoC',
    //   RepoLink: 'https://github.com/kossiitkgp/KWoC',
    //   owner: 'kossiitkgp',
    // },
  ]);

  const [stats, setStats] = useState({});
  const [pulls, setPulls] = useState([])

  const [extraCommits, setExtraCommits] = useState([])
  const [extraLinesAdded, setExtraLinesAdded] = useState(0)
  const [extraLinesRemoved, setExtraLinesRemoved] = useState(0)

  const announcements = [
    {
      date: 'November 28, 2020',
      content: 'Coding Period begins on 6th December!',
    },
  ];

  const resources = [
    {
      message: 'Writing Kickass READMEs',
      url: 'http://www.bauva.com/blog/Writing-Kickass-READMEs/',
      avatar: 'http://www.bauva.com/images/bio-photo.jpg',
    },
    {
      message: 'Everything you need to ace KWoC',
      url:
        'https://medium.com/kharagpur-open-source-society/an-informal-introduction-to-kwoc-62fc5e686f79',
      avatar: 'https://miro.medium.com/max/66/1*S7YHjDmgGnBEJcE116qQ7w.jpeg',
    },
    {
      message: 'How to choose a Project for KWoC',
      url: 'https://telegra.ph/How-to-choose-a-Project-for-KWoC-12-01',
      avatar: 'https://telegra.ph/favicon.ico',
    },
    {
      message: 'Codeacademy: Learn Git',
      url: 'https://www.codecademy.com/learn/learn-git',
      avatar: 'https://www.codecademy.com/favicon.ico',
    },
    {
      message: 'Git Flight Rules: Cookbook for Git',
      url: 'https://github.com/k88hudson/git-flight-rules',
      avatar: 'https://github.com/k88hudson.png',
    },
    {
      message: 'GitHub: Hello World Tutorial',
      url: 'https://guides.github.com/activities/hello-world/',
      avatar: 'https://guides.github.com/favicon.ico',
    },
  ];

  useEffect(() => {
    const pathname = window.location.pathname;
    const splitArr = window.location.pathname.split('/')
    const student_username = splitArr[splitArr.length - 1]
    setUsername(student_username)
    const URL = `${BACKEND_URL}/student/dashboard`;
    const data = {
      username: student_username,
    };
    let last_commit = ``
    fetch(URL, {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        setFullName(res.name);
        setCollegeName(res.college);
      })
      .catch((err) => {
        alert('Server Error, Please try again !');
      });

    axios
      .get(`https://stats.metamehta.me/stats/student/${student_username}`)
      .then((res) => {
        setStats(res.data[student_username]);
        last_commit = res.data[student_username]['commits'][0]['html_url']
        console.log('last commit below assignment ', res.data[student_username]['commits'][0]['html_url'])
        console.log(res.data[student_username]);
      })
      .catch((err) => {
        alert('Server error, Try again');
      });

      /* testing for real time code*/
      try {
        async function calls_fetch() {
          const base_date = new Date('2020-12-05T17:30:00Z')
          let prs_for_events = []
          let base_url = `https://api.github.com/users/${student_username}/events?per_page=100`
          let page_num = 1
          while(1) {
            let events, events_length, last_event_date
             events = await fetch_calls(base_url + `&page=${page_num}`)
             events_length = events.length
            if(events[events_length-1] != undefined)
              last_event_date = new Date(events[events_length-1]['created_at'])
            if(last_event_date > base_date) {
              prs_for_events.push(...events)
              page_num = page_num + 1
            } else {
              let filtered_events = events.filter(item => {
              let item_date = new Date(item['created_at'])
                return item_date > base_date
              })
              prs_for_events.push(...filtered_events)
              break
            }
          }
          return prs_for_events
        }
      
        async function fetch_final_data() {
          let prs_for_events = await  calls_fetch();
          let pulls_for_kwoc_event = []
          let pushes_for_kwoc_event = []
          let repos_set = new Set()
  
          
          prs_for_events.forEach(item => {
            if(Projects.hasOwnProperty(item['repo']['name'].toLowerCase())) {
              repos_set.add(item['repo']['name'])
              if(item['type'] === 'PullRequestEvent' && item['payload']['action'] !== 'closed')
                pulls_for_kwoc_event.push(item)
              else if(item['type'] === 'PushEvent')
                pushes_for_kwoc_event.push(item)
            } 
           })
    
           console.log('repos involved are ', repos_set)
           console.log('pulls are', pulls_for_kwoc_event)
           setPulls(pulls_for_kwoc_event)
           /* Pull requests and their URLS have been soughted at this point, now need to work on commits*/
           console.log('pushes are ', pushes_for_kwoc_event)
           
           console.log('last commit is ',last_commit)
           // know the last date for commit
          let api_url_last_commmit, last_commit_data, last_timestamp_of_stats;
            api_url_last_commmit = last_commit.replace('github.com/', 'api.github.com/repos/').replace('/commit/', '/commits/')
           try {
            last_commit_data = await fetch_calls(api_url_last_commmit)
            last_timestamp_of_stats = last_commit_data['commit']['committer']['date']
            }
            catch (err) {
              console.log('if error in last_time stamp')
              return
            }
            
           let extra_kwoc_commits = []
           for(let repo of repos_set) {
              let base_url = `https://api.github.com/repos/${repo}/commits?author=${student_username}&since=${last_timestamp_of_stats}`
              let commits_data = await fetch_calls(base_url)
              for(let commit of commits_data) {
                if(commit['commit']['committer']['date'] == last_timestamp_of_stats)
                  break
                  let commit_url = commit['url']
                  let indiv_commit_data = await fetch_calls(commit_url)
                  extra_kwoc_commits.push({
                    'html_url': commit['html_url'],
                    'project': repo,
                    'message': commit['commit']['message'],
                    'lines_added': indiv_commit_data['stats']['additions'],
                    'lines_removed': indiv_commit_data['stats']['deletions']
                  })
                }
               
              }
        
  
          setExtraCommits(extra_kwoc_commits)
          if(extra_kwoc_commits.length !== 0) {
           let lines_added = 0
           let lines_removed = 0
           for(let com of extra_kwoc_commits) {
             lines_added += com['lines_added']
           }
           for(let com of extra_kwoc_commits) {
            lines_removed += com['lines_added']
          }
         setExtraLinesAdded(lines_added)
         setExtraLinesRemoved(lines_removed)
          
          }
        }
  
        fetch_final_data()
      } catch(err) {
        console.log('error came somewhere')
        return
      }

    }, []);

  // sample data kept for future reference
  // let data = {
  //   name: 'Aditya Vikram Singh',
  //   github: 'xypnox',
  //   college: 'IIT Kharagpur',
  //   commits: {
  //     count: 235,
  //     commits: [
  //       {
  //         hash: '234rrt',
  //         project: 'xypnox/xyplot',
  //         messsage: 'Compress residual images for faster loading speed',
  //       },
  //       {
  //         hash: 'aw3548',
  //         project: 'kossiitkgp/darkHorse',
  //         messsage: 'Fix: Typo and spacing',
  //       },
  //       {
  //         hash: 'hhstb32',
  //         project: 'xypnox/todxpy',
  //         messsage: 'Introduce new sorting for todos',
  //       },
  //       {
  //         hash: 'y67eb6',
  //         project: 'kossiitkgp/KWoC',
  //         messsage: 'Replace navbar with footer for fun',
  //       },
  //     ],
  //   },
  //   // this is the total sum of PRs for all the projects that he has been mentoring.
  //   pullRequests: {
  //     count: 12,
  //     open: 5,
  //     closed: 6,
  //   },
  //   linesOfCode: {
  //     count: '126k',
  //   },
  //   languages: ['Python', 'Javascript', 'HTML', 'CSS'],
  //   projects: ['darkHorse', 'todxpy', 'KWoC'],
  //   resources: [
  //     {
  //       message: 'Writing Kickass READMEs',
  //       url: 'http://www.bauva.com/blog/Writing-Kickass-READMEs/',
  //       avatar: 'http://www.bauva.com/images/bio-photo.jpg',
  //     },
  //     {
  //       message: 'Make a README',
  //       url: 'https://www.makeareadme.com/',
  //       avatar:
  //         'https://d33wubrfki0l68.cloudfront.net/ca149ad795cbdbe3a450dd7985baf0d763cc2fb6/0220f/images/owlbert.jpg',
  //     },
  //     {
  //       message: 'How to Write Beautiful and Meaningful README.md',
  //       url:
  //         'https://blog.bitsrc.io/how-to-write-beautiful-and-meaningful-readme-md-for-your-next-project-897045e3f991',
  //       avatar:
  //         'https://miro.medium.com/fit/c/96/96/1*50FKErsxynOeSmrUZk5Bsw.jpeg',
  //     },
  //     {
  //       message: 'What being a Google Summer of Code mentor taught me?',
  //       url:
  //         'https://hackernoon.com/what-being-a-google-summer-of-code-mentor-taught-me-8c97aad503a5',
  //       avatar:
  //         'https://hackernoon.com/avatars/pwtNTVrD7BPYArwg776n1wGXP193.png',
  //     },
  //     {
  //       message: 'Official GSoC Mentoring Guide',
  //       url: 'https://google.github.io/gsocguides/mentor/mind-the-gap',
  //       avatar: 'https://google.github.io/gsocguides/images/sun-small.png',
  //     },
  //     {
  //       message: 'OSS Maintainer and being a Mentor',
  //       url: 'https://www.bwplotka.dev/2020/how-to-became-oss-maintainer/',
  //       avatar: 'https://www.bwplotka.dev/images/profile.jpg',
  //     },
  //   ],
  //   student: ['yashrsharma44', 'rakaar', 'orkohunter'],
  //   announcement: [
  //     'Hi the KWOC has just started!',
  //     'Make sure you have submitted the mideval feedback for the student!',
  //     'Hi \n, the end evals have been finished!',
  //   ],
  //   evals: 'Mid Eval',
  // };

  let resourceList = [];
  for (const [index, elements] in resources.entries()) {
    resourceList.push(<li key={index}>{elements}</li>);
  }

  return (
    <div className='student-dashboard-body dashboard-container'>
      <div className='dashboard'>
        <link
          href='https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap'
          rel='stylesheet'
        ></link>
        <link rel='stylesheet' href='font-awesome/css/font-awesome.css'></link>
        <link
          href='https://fonts.googleapis.com/css2?family=Staatliches&display=swap'
          rel='stylesheet'
        ></link>
        {/*

         Mentor Dashboard here
            Plans to include the following
             -> Useful links - how to write README, others if any?
             -> Important Announcements
             -> Stats of indiv Mentor ???
      */}
        <Navbar className='is-black' />
        <div className='title-dashboard'>
          <h1>Student Dashboard</h1>
        </div>
        <div className='intro-card'>
          <div className='avatar grow-card'>
            <img
              src={`https://github.com/${username}.png`}
              className='avatar-img'
              alt="Mentor's GitHub Avatar"
            ></img>
            <br />
            <div className='avatar-content'>
              <p id='mentor-name'>{fullName}</p>
              <p id='mentor-username'>
                {username}
              </p>
              <p id='mentor-username'>{collegeName}</p>
            </div>
          </div>

          <div className='mentor-stats '>
            <div className='mentor-stats-header'>
              <h1>Stats</h1>
              <p className='stats-message'>
                Stats will be updated once coding period begins
              </p>
              <br />
            </div>
            {/**Keep the font-mentor-header to a single word, multiple words create a bad UI experience */}
            <div className='mentor-stats-content'>
              <div className='card-component non-purple-card mstats grow-card'>
                <p className='font-mentor-header'>Commits</p>
                <p className='font-mentor-stats'>{stats['no_of_commits']}</p>
              </div>

              <div className='card-component purple-card mstats  grow-card'>
                <p className='font-mentor-header'>
                  Pull Requests <br />
                  (open+closed)
                </p>
                <p className='font-mentor-stats'>
                  {pulls != undefined && pulls.length}
                </p>
              </div>

              <div className='card-component non-purple-card mstats  grow-card'>
                <p className='font-mentor-header'>Lines of Code</p>
                <h1>(+/-)</h1>
                <p className='font-mentor-stats'>
                  {trim_lines(parseInt(stats['lines_added']) + extraLinesAdded)}/{trim_lines(parseInt(stats['lines_removed']) + extraLinesRemoved)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='projects'>
          <div className='project-header'>
            <h1>Languages involved</h1>
          </div>
          <div style={{ textAlign: 'center' }}>
            {stats['languages'] != undefined &&
              stats['languages'].map((item) => (
                <span
                  className='tag is-dark is-large'
                  style={{ margin: '5px' }}
                >
                  {item}
                </span>
              ))}
          </div>
        </div>

        <div className='projects'>
          <div className='project-header'>
            <h1>Projects</h1>
          </div>
          <div style={{ textAlign: 'center' }}>
            {stats['projects'] != undefined &&
              stats['projects'].map((item) => (
                <span
                  className='tag is-dark is-large is-info'
                  style={{ margin: '5px' }}
                >
                  <a
                    href={`https://github.com/${item}`}
                    style={{ color: 'white' }}
                  >
                    {item}
                  </a>
                </span>
              ))}
          </div>
        </div>

        <div className='projects'>
          <div className='project-header'>
            <h1>Pull Reqests</h1>
          </div>
          <div>
            {pulls != undefined ? (
              <table id='commits-table' className='table is-striped'>
                <thead>
                  <tr>
                    <th style={{ color: 'white' }}>
                      <h3>Project</h3>
                    </th>
                    <th style={{ color: 'white' }}>
                      <h3>Pull Request</h3>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pulls.map((item) => {
                    return (
                      <tr>
                        <td>
                          <a
                            className='project-in-commit-table'
                            href={`https://github.com/${item['repo']['name']}`}
                          >
                            {item['repo']['name']}
                          </a>
                        </td>
                        
                        <td><a href={item['payload']['pull_request']['html_url']} style={{color: 'white'}}>{trim_message(item['payload']['pull_request']['title'])}</a></td>
                        
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              ''
            )}
            </div>
        </div>

        <div className='projects'>
          <div className='project-header'>
            <h1>Commits</h1>
          </div>
          <div>
            {stats['commits'] != undefined && extraCommits != undefined ? (
              <table id='commits-table' className='table is-striped'>
                <thead>
                  <tr>
                    <th style={{ color: 'white' }}>
                      <h3>Project</h3>
                    </th>
                    <th style={{ color: 'white' }}>
                      <h3>Commit</h3>
                    </th>
                    <th style={{ color: 'white' }}>
                      <h3>Lines</h3>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {[...extraCommits,...stats['commits']].map((item) => {
                    return (
                      <tr>
                        <td>
                          <a
                            className='project-in-commit-table'
                            href={`https://github.com/${item['project']}`}
                          >
                            {item['project']}
                          </a>
                        </td>
                        <td><a href={item['html_url']} style={{color: 'white'}}>{trim_message(item['message'])}</a></td>
                        <td>
                          +{trim_lines(item['lines_added'])},-{trim_lines(item['lines_removed'])}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}