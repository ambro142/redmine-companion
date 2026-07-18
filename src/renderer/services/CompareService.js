class CompareService {

    static compare(oldDashboard, newDashboard) {

        const changes = [];

        if (!newDashboard)
            return changes;

        const oldMap = new Map();

        if (oldDashboard) {

            oldDashboard.all.forEach(issue => {

                oldMap.set(issue.id, issue);

            });

        }

        newDashboard.all.forEach(issue => {

            const oldIssue = oldMap.get(issue.id);

            // Новая задача
            if (!oldIssue) {

                return;

            }

            // Любое изменение задачи
            if (oldIssue.updated_on !== issue.updated_on) {

                changes.push({

                    type: "updated",
                    issue

                });

            }

            // Статус
            if (
                (oldIssue.status?.id || 0) !==
                (issue.status?.id || 0)
            ) {

                changes.push({

                    type: "status",

                    issue,

                    oldValue:
                        oldIssue.status?.name || "—",

                    newValue:
                        issue.status?.name || "—"

                });

            }

            // Исполнитель
            if (
                (oldIssue.assigned_to?.id || 0) !==
                (issue.assigned_to?.id || 0)
            ) {

                changes.push({

                    type: "assigned",

                    issue,

                    oldValue:
                        oldIssue.assigned_to?.name ||
                        "Не назначен",

                    newValue:
                        issue.assigned_to?.name ||
                        "Не назначен"

                });

            }

            // Приоритет
            if (
                (oldIssue.priority?.id || 0) !==
                (issue.priority?.id || 0)
            ) {

                changes.push({

                    type: "priority",

                    issue,

                    oldValue:
                        oldIssue.priority?.name || "—",

                    newValue:
                        issue.priority?.name || "—"

                });

            }

            // Срок
            if (
                (oldIssue.due_date || "") !==
                (issue.due_date || "")
            ) {

                changes.push({

                    type: "due",

                    issue,

                    oldValue:
                        oldIssue.due_date || "Не указан",

                    newValue:
                        issue.due_date || "Не указан"

                });

            }

        });

        return changes;

    }

    static async compareFromHistory(dashboard){

        const changes=[];

        for(const issue of dashboard.all){

            const old =
                await window.api.getHistory(issue.id);

            if(!old){

                continue;

            }

            if(old.updatedOn===issue.updated_on){

                continue;

            }

            if(old.status!==issue.status?.id){

                changes.push({

                    type:"status",

                    issue,

                    oldValue:old.status,

                    newValue:issue.status?.name

                });

            }

            if(old.assigned!==(issue.assigned_to?.id||null)){

                changes.push({

                    type:"assigned",

                    issue,

                    oldValue:old.assigned,

                    newValue:
                        issue.assigned_to?.name||
                        "Не назначен"

                });

            }

            if(old.priority!==(issue.priority?.id||null)){

                changes.push({

                    type:"priority",

                    issue,

                    oldValue:old.priority,

                    newValue:
                        issue.priority?.name

                });

            }

         if(old.due!==(issue.due_date||null)){

                changes.push({

                    type:"due",

                    issue,

                    oldValue:old.due,

                    newValue:issue.due_date

                });

            }

            changes.push({

                type:"updated",

                issue

            });

        }

        return changes;

    }

    static compareIssue(old,issue){

        const changes=[];

        if(old.updatedOn===issue.updated_on)
            return changes;

        if(old.status!==issue.status?.name){

            changes.push({

                type:"status",

                issue,

                oldValue:old.status,

                newValue:issue.status?.name

            });

        }

        if(old.assigned!==(issue.assigned_to?.name||null)){

            changes.push({

                type:"assigned",

                issue,

                oldValue:old.assigned,

                newValue:
                    issue.assigned_to?.name||
                    "Не назначен"

            });

        }

        if(old.priority!==(issue.priority?.name||null)){

            changes.push({

                type:"priority",

                issue,

                oldValue:old.priority,

                newValue:
                    issue.priority?.name

            });

        }

        if(old.due!==(issue.due_date||null)){

            changes.push({

                type:"due",

                issue,

                oldValue:old.due,

                newValue:
                    issue.due_date

            });

        }   

        changes.push({

            type:"updated",

            issue

        });

        return changes;

    }
}

window.CompareService = CompareService;