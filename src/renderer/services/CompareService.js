class CompareService {

    static compareIssue(old,issue){

        const changes=[];

        if(old.updatedOn===issue.updated_on)
            return changes;

        // Сравниваем по id, а не по локализованному названию —
        // название статуса/приоритета зависит от языка интерфейса Redmine,
        // а id остаётся стабильным.

        if(old.statusId !== (issue.status?.id ?? null)){

            changes.push({

                type:"status",
                issue,
                oldValue:old.status,
                newValue:issue.status?.name

            });

        }

        if(old.assignedId !== (issue.assigned_to?.id ?? null)){

            changes.push({

                type:"assigned",
                issue,
                oldValue:old.assigned,
                newValue:
                    issue.assigned_to?.name||
                    I18nService.t("common.unassigned")

            });

        }

        if(old.priorityId !== (issue.priority?.id ?? null)){

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
