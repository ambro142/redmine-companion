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

window.IssueFilterService=

    IssueFilterService;