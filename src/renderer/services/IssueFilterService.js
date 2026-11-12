class IssueFilterService {

    static filter(

        issues,

        mode,

        closedStatuses

    ) {

        if(mode==="active"){

            return issues.filter(issue=>

                !closedStatuses.has(

                    issue.status.id

                )

            );

        }

        const now = Date.now();

        return issues.filter(issue=>{

            if(

                !closedStatuses.has(

                    issue.status.id

                )

            )

                return true;

            const updated =

                new Date(

                    issue.updated_on

                );

            const days =

                (now-updated)

                /86400000;

            return days<=7;

        });

    }

}

// Фильтр по проекту / трекеру / статусу. Пустое значение = "все".
IssueFilterService.filterByFields = function (issues, fields) {

    const projectId = fields && fields.projectId;
    const trackerId = fields && fields.trackerId;
    const statusId = fields && fields.statusId;

    return issues.filter(issue =>
        (!projectId || String(issue.project?.id) === String(projectId)) &&
        (!trackerId || String(issue.tracker?.id) === String(trackerId)) &&
        (!statusId || String(issue.status?.id) === String(statusId))
    );

};

// Списки проектов и трекеров, которые реально встречаются в задачах
IssueFilterService.collectOptions = function (issues) {

    const projects = new Map();
    const trackers = new Map();

    issues.forEach(issue => {

        if (issue.project)
            projects.set(issue.project.id, issue.project.name);

        if (issue.tracker)
            trackers.set(issue.tracker.id, issue.tracker.name);

    });

    const toList = map => [...map.entries()]
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));

    return {
        projects: toList(projects),
        trackers: toList(trackers)
    };

};

window.IssueFilterService=

    IssueFilterService;